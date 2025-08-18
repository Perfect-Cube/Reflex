import dataclasses
from cocoindex import FlowBuilder, DataScope
from cocoindex.sources import DuckDBSource
from cocoindex.functions import ExtractByLlm
from cocoindex.targets import Neo4jPropertyGraphTarget

# Define the structure of the information we want to extract from the chat.
# We are looking for simple "Subject -> Predicate -> Object" triples.
@dataclasses.dataclass
class Relationship:
    """A relationship between two entities, like 'Paris is in France'."""
    subject: str
    predicate: str
    object: str

def build_knowledge_graph_flow(flow_builder: FlowBuilder, data_scope: DataScope):
    """
    This function defines the data processing flow for coco-index.
    It reads from DuckDB, uses an LLM to extract relationships, and writes to Neo4j.
    """
    # 1. SOURCE: Read all messages from our chat database.
    data_scope["messages"] = flow_builder.add_source(
        DuckDBSource(db_file="chat_history.db", query="SELECT content FROM messages WHERE role='user'")
    )

    # 2. TRANSFORM: Use an LLM to extract structured 'Relationship' data from the text.
    data_scope["relationships"] = data_scope["messages"].transform(
        "content",
        ExtractByLlm(
            # NOTE: For extraction, a more powerful model often works better,
            # but we'll stick with gemma-3 for consistency.
            llm_spec={
                "provider": "hf",
                "model": "google/gemma-3-270m-it",
            },
            data_class=Relationship,
            instruction="Extract the primary subject, predicate, and object from the user's statement. For example, in 'The Eiffel Tower is in Paris', the subject is 'Eiffel Tower', predicate is 'is in', and object is 'Paris'. If no clear relationship is stated, return nothing.",
        ),
        "relationships"
    )

    # 3. TARGET: Load the extracted relationships into a Neo4j graph database.
    # IMPORTANT: You must have Neo4j running and provide your credentials here.
    flow_builder.add_target(
        Neo4jPropertyGraphTarget(
            uri="bolt://localhost:7687",  # Default Neo4j URI
            user="neo4j",
            password="YOUR_NEO4J_PASSWORD", # <-- CHANGE THIS
            source=data_scope["relationships"],
            subject_key="subject",
            object_key="object",
            predicate_key="predicate",
        )
    )