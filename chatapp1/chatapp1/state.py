# import reflex as rx
# import torch
# from transformers import pipeline, AutoTokenizer
# import json
# from . import db
# from . import tools # Import our new tools file

# # --- Model Loading ---
# try:
#     model_id = "google/gemma-3-270m-it"
#     pipe = pipeline("text-generation", model=model_id, device_map="auto")
#     # We need the tokenizer separately to build the prompt with tool info
#     tokenizer = AutoTokenizer.from_pretrained(model_id)
#     model_loaded = True
# except Exception as e:
#     print(f"Error loading model: {e}")
#     pipe = None
#     tokenizer = None
#     model_loaded = False


# # --- Application State ---
# class State(rx.State):
#     user_id: str = "default_user"
#     question: str
#     chat_history: list[tuple[str, str]]=[]
#     is_processing: bool = False

#     # @rx.call_on_load
#     def load_history(self):  # The decorator is now gone
#         self.chat_history = db.get_history(self.user_id)
#         if not model_loaded:
#             self.chat_history.append(
#                 ("assistant", "Model failed to load. Please check the terminal for errors.")
#             )

#     async def answer(self):
#         if self.is_processing or not self.question.strip() or not model_loaded:
#             return

#         self.is_processing = True
#         try:
#             # Add user message to UI and DB immediately
#             user_question = self.question
#             self.question = ""
#             self.chat_history.append(("user", user_question))
#             db.add_message(self.user_id, "user", user_question)
#             yield

#             # --- Agentic Loop: Decide, Act, Respond ---
            
#             # Step 1: First LLM call to decide if a tool is needed
#             messages = [{"role": role, "content": content} for role, content in self.chat_history]
            
#             # This is a special prompt that tells the model it can use tools.
#             prompt = tokenizer.apply_chat_template(
#                 messages,
#                 tokenize=False,
#                 add_generation_prompt=True,
#                 tools=[tools.search_tool_config] # <-- Pass the tool description here
#             )

#             outputs = pipe(prompt, max_new_tokens=256, do_sample=False)
#             first_response = outputs[0]["generated_text"].replace(prompt, "").strip()

#             # Step 2: Check if the model decided to use a tool
#             if "<tool_code>" in first_response:
#                 tool_call_str = first_response.split("<tool_code>")[-1].split("</tool_code>")[0]
#                 tool_call = json.loads(tool_call_str)
                
#                 # Step 3: Execute the tool
#                 if tool_call["name"] == "web_search":
#                     tool_result = tools.web_search(query=tool_call["arguments"]["query"])
                    
#                     # Step 4: Second LLM call to generate a final answer using the tool's result
#                     tool_result_message = {"role": "tool", "content": tool_result}
#                     messages.append(tool_result_message)
                    
#                     final_prompt = tokenizer.apply_chat_template(
#                         messages, tokenize=False, add_generation_prompt=True
#                     )
                    
#                     final_outputs = pipe(final_prompt, max_new_tokens=512)
#                     assistant_response = final_outputs[0]["generated_text"].replace(final_prompt, "").strip()
#                 else:
#                     assistant_response = "Error: Model tried to use an unknown tool."
#             else:
#                 # If no tool was used, the first response is the final answer
#                 assistant_response = first_response

#             # Add final response to UI and DB
#             self.chat_history.append(("assistant", assistant_response))
#             db.add_message(self.user_id, "assistant", assistant_response)

#         finally:
#             self.is_processing = False
#             yield

import reflex as rx

class State(rx.State):
    chat_history: list[tuple[str, str]] = [("user", "Hello!")]
    question: str = ""
    is_processing: bool = False

    def set_question(self, value: str):
        self.question = value

    def answer(self):
        # Example: just echo the question
        self.chat_history.append(("user", self.question))
        self.chat_history.append(("bot", f"You said: {self.question}"))
        self.question = ""

    def load_history(self):
        pass