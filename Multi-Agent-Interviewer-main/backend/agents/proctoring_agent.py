import cv2
import numpy as np
import time

class ProctoringAgent:
    def __init__(self, session_id):
        self.session_id = session_id
        # Load pre-trained Haar Cascade models for face and eye detection
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        
        # --- STATE TRACKING FOR LENIENCY ---
        # Instead of instant warnings, we use counters. A warning is only triggered
        # if a counter exceeds its threshold. Each check happens every ~2 seconds.
        
        # Thresholds (number of consecutive failed checks before a warning)
        self.NO_FACE_THRESHOLD = 4  # Approx. 8 seconds without a face
        self.NO_EYES_THRESHOLD = 3  # Approx. 6 seconds of looking away
        self.HEAD_EDGE_THRESHOLD = 4 # Approx. 8 seconds of sustained awkward head position

        # Current counters
        self.no_face_counter = 0
        self.no_eyes_counter = 0
        self.head_edge_counter = 0

    async def process_frame(self, frame_bytes):
        # Decode the image bytes from the frontend into an OpenCV image
        nparr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            return "" # Ignore corrupted or empty frames

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
        
        anomaly_detected = ""

        # --- ANOMALY DETECTION LOGIC ---

        # 1. Multiple faces detected (Immediate Warning - This is a hard rule)
        if len(faces) > 1:
            return "Multiple faces detected in the frame."

        # 2. No face detected (Persistent Check)
        if len(faces) == 0:
            self.no_face_counter += 1
            # Reset other counters since we can't check them without a face
            self.no_eyes_counter = 0
            self.head_edge_counter = 0
            
            # Only trigger a warning if the face has been missing for a sustained period
            if self.no_face_counter >= self.NO_FACE_THRESHOLD:
                anomaly_detected = "Candidate not visible in the frame."
                self.no_face_counter = 0 # Reset counter after triggering
        
        # 3. If one face is detected (Normal case, check for subtle issues)
        else:
            # If a face is found, reset the no-face counter
            self.no_face_counter = 0
            
            x, y, w, h = faces[0]
            face_roi_gray = gray[y:y+h, x:x+w] # Region of Interest for the face
            
            # 3a. Eye Detection (Gaze Aversion Check)
            eyes = self.eye_cascade.detectMultiScale(face_roi_gray)
            if len(eyes) == 0:
                self.no_eyes_counter += 1
                # Only warn if eyes are not visible for a sustained period
                if self.no_eyes_counter >= self.NO_EYES_THRESHOLD:
                    anomaly_detected = "Candidate may be looking away from the screen."
                    self.no_eyes_counter = 0
            else:
                # If eyes are found, reset the counter
                self.no_eyes_counter = 0

            # 3b. Head Position Check
            frame_width = frame.shape[1]
            face_center_x = x + w / 2
            # Check if the face is persistently at the very edge of the frame
            if face_center_x < frame_width * 0.20 or face_center_x > frame_width * 0.80:
                self.head_edge_counter += 1
                if self.head_edge_counter >= self.HEAD_EDGE_THRESHOLD:
                    anomaly_detected = "Sustained irregular head position detected."
                    self.head_edge_counter = 0
            else:
                # If head is reasonably centered, reset the counter
                self.head_edge_counter = 0
                 
        return anomaly_detected