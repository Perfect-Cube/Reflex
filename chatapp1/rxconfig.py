import reflex as rx

config = rx.Config(
    app_name="chatapp1",
    plugins=[
        rx.plugins.SitemapPlugin(),
        rx.plugins.TailwindV4Plugin(),
    ],
)