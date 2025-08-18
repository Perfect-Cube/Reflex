import reflex as rx
from .state import State

def message_bubble(message: tuple[str, str]) -> rx.Component:
    role = message[0]
    text = message[1]
    is_user = (role == "user")

    bubble_style = {
        "padding": "1em",
        "border_radius": "1em",
        "max_width": "70%",
        "box_shadow": "0px 2px 5px rgba(0,0,0,0.1)",
        "align_self": rx.cond(is_user, "flex-end", "flex-start"),
        "background_color": rx.cond(is_user, "#dcf8c6", "#ffffff"),
        "margin_y": "0.5em",
    }
    
    return rx.box(
        rx.text(text, white_space="pre-wrap"),
        style=bubble_style,
    )

# def chat_interface() -> rx.Component:
#     return rx.box(
#         rx.vstack(
#             rx.box(
#                 rx.foreach(State.chat_history, message_bubble),
#                 width="100%",
#                 overflow_y="auto",
#                 padding="1em",
#             ),
#             height="85vh", 
#             width="100%",
#         ),
#         rx.center(
#             rx.hstack(
#                 rx.input(
#                     placeholder="Ask a question...",
#                     value=State.question,
#                     on_change=State.set_question,
#                     on_blur=State.set_question,
#                     on_key_down=lambda event: rx.cond(
#                         event == "Enter",
#                         State.answer,
#                         None
#                     ),
#                     flex_grow=1,
#                 ),
#                 rx.button(
#                     "Send", 
#                     on_click=State.answer, 
#                     is_disabled=rx.cond(State.question.strip() == "", True, False) | State.is_processing
#                 ),
#                 width="80%",
#                 padding_bottom="1em",
#             ),
#             width="100%",
#         ),
#         height="100vh",
#         width="100%",
#         display="flex",
#         flex_direction="column",
#     )
def chat_interface() -> rx.Component:
    return rx.text("Hello, Reflex is working!")

app = rx.App(
    theme=rx.theme(
        appearance="light",
    )
)
app.add_page(chat_interface, on_load=State.load_history, title="Gemma-3 Chat")