import json
from autogen import ConversableAgent, GroupChat, GroupChatManager
from core.config import settings

class AgentOrchestrator:
    def __init__(self, past_feedback: str = ""):
        """
        Initializes all agents with their specific models, API keys, and system prompts.
        """
        # --- LLM CONFIGURATIONS PER AGENT ---
        # Added a dummy price to silence the "Model not found" warning from autogen.
        # This tells autogen not to worry about cost tracking for these custom models.
        
        llm_config_interviewer = {
            "config_list": [{
                "model": "openai/gpt-oss-120b",
                "api_key": settings.GROQ_API_KEY_INTERVIEWER,
                "base_url": "https://api.groq.com/openai/v1",
                "price": [0, 0] # Silences cost tracking warning
            }],
            "temperature": 0.7,
            "max_tokens": 8192
        }
        
        llm_config_evaluator = {
            "config_list": [{
                "model": "meta-llama/llama-4-maverick-17b-128e-instruct",
                "api_key": settings.GROQ_API_KEY_EVALUATOR,
                "base_url": "https://api.groq.com/openai/v1",
                "price": [0, 0] # Silences cost tracking warning
            }],
            "temperature": 0.5,
            "max_tokens": 1024
        }

        llm_config_simulator = {
            "config_list": [{
                "model": "gemma2-9b-it",
                "api_key": settings.GROQ_API_KEY_SIMULATOR,
                "base_url": "https://api.groq.com/openai/v1",
                "price": [0, 0] # Silences cost tracking warning
            }],
            "temperature": 1,
            "max_tokens": 1024
        }
        
        # --- AGENT DEFINITIONS ---
        
        self.interviewer_agent = ConversableAgent(
            name="Interviewer_Agent",
            system_message=f"""You are Alex, an expert AI interviewer for Excel roles. Your primary goal is to assess a candidate's skills through a structured conversation.
            **Past Feedback for Improvement:** Based on previous reviews, remember the following: '{past_feedback or "No specific feedback yet. Follow standard procedure."}'
            **Your Task:** Your only job is to generate the NEXT response in the conversation based on the history provided.
            - Ask one clear question at a time.
            - Guide the conversation through foundational, scenario-based, and practical tasks.
            - After your final concluding remarks, you MUST end your response with the single word "TERMINATE".
            """,
            llm_config=llm_config_interviewer,
        )

        self.evaluation_agent = ConversableAgent(
            name="Evaluation_Agent",
            system_message="""You are a silent evaluation agent. Your only task is to analyze the provided interview transcript.
            Generate ONLY a single, valid JSON object with the following keys:
            - "score": An integer from 0 to 100 representing the candidate's overall proficiency.
            - "summary": A concise 2-3 sentence summary of the candidate's performance.
            - "strengths": A string containing a bulleted list of the candidate's key strengths.
            - "weaknesses": A string containing a bulleted list of the candidate's areas for improvement.
            Do not add any text or formatting before or after the JSON object.
            """,
            llm_config=llm_config_evaluator,
        )
        
        self.feedback_agent = ConversableAgent(
            name="Feedback_Agent",
            system_message="""You are an AI System Analyst. You will be given an interview transcript and feedback from a human admin. 
            Your task is to analyze both and provide a concise, one-sentence, actionable suggestion for how the Interviewer Agent can improve in future interviews.
            Example: "Suggestion: The Interviewer Agent should ask for a specific code example when a candidate discusses complex formulas."
            Output ONLY the single sentence suggestion.
            """,
            llm_config=llm_config_evaluator,
        )

        self.candidate_agent = ConversableAgent(
            name="Candidate_Agent",
            system_message="""You are a job candidate with intermediate Excel skills. You are confident about VLOOKUP, PivotTables, and basic formulas, but you might be slightly hesitant or need a moment to think about complex nested formulas or advanced topics like dynamic arrays. Answer questions naturally and professionally as this persona.
            """,
            llm_config=llm_config_simulator,
        )

    def get_initial_message(self, candidate_name: str):
        """Generates the very first message from the AI without any prior conversation history."""
        # We manually craft the initial prompt to the LLM to kick things off.
        initial_prompt = f"The candidate, {candidate_name}, has just joined the interview. Please provide a professional and welcoming introduction and ask your first foundational question."
        initial_history = [{"role": "user", "content": initial_prompt}]
        ai_response = self.interviewer_agent.generate_reply(messages=initial_history)
        return ai_response

    def get_ai_reply(self, chat_history: list):
        """
        Generates the AI's next response based on the entire conversation history.
        This is the new core method for the turn-by-turn interview.
        """
        # The 'chat_history' is a list of OpenAI-formatted message dicts, e.g., [{"role": "user", "content": "..."}]
        ai_response = self.interviewer_agent.generate_reply(messages=chat_history)
        return ai_response

    def generate_report(self, transcript: str):
        """Generates a JSON report from the Evaluation Agent."""
        response = self.evaluation_agent.generate_reply(messages=[{"role": "user", "content": transcript}])
        try:
            # Clean the response to extract only the JSON part, making it more robust.
            json_str = response.strip().split('```json')[-1].split('```')[0].strip()
            json.loads(json_str) # Validate that it's proper JSON
            return json_str
        except (json.JSONDecodeError, IndexError):
            # Fallback in case the LLM response is not formatted as expected
            return '{"score": 0, "summary": "Error generating report.", "strengths": "N/A", "weaknesses": "The AI evaluation agent did not return a valid JSON response."}'

    def process_feedback(self, transcript: str, admin_feedback: str):
        """Generates an actionable suggestion from the Feedback Agent."""
        prompt = f"TRANSCRIPT:\n{transcript}\n\nADMIN FEEDBACK:\n{admin_feedback}"
        suggestion = self.feedback_agent.generate_reply(messages=[{"role": "user", "content": prompt}])
        return suggestion

    def run_simulation(self):
        """Runs a full, automated simulation between the Interviewer and Candidate agents."""
        # GroupChat is now ONLY used for the simulation, which is the correct approach.
        groupchat = GroupChat(
            agents=[self.interviewer_agent, self.candidate_agent],
            messages=[],
            max_round=8, # A short, simulated interview
            speaker_selection_method="round_robin" # Silences the "underpopulated" warning
        )
        manager = GroupChatManager(groupchat=groupchat, llm_config=self.candidate_agent.llm_config)
        
        self.interviewer_agent.initiate_chat(manager, message="Hello Candidate. Let's start the simulation. Can you explain what a PivotTable is?")
        
        # Filter out empty messages that can sometimes occur in autogen
        transcript = [{"sender": msg['name'], "text": msg['content']} for msg in groupchat.messages if msg['content']]
        return transcript