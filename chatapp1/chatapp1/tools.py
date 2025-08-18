import requests
from bs4 import BeautifulSoup

# 1. Tool Configuration for the Model
# This dictionary describes the tool to the LLM. It explains the tool's name,
# what it does, and what parameters (arguments) it requires. This structured
# format helps the model understand how and when to use the tool.
search_tool_config = {
    "type": "function",
    "function": {
        "name": "web_search",
        "description": "Searches the web for up-to-date information on a given topic. Use this for recent events, current affairs, or topics the model may not have been trained on.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The specific search query to find information about. For example: 'latest news on AI developments'."
                }
            },
            "required": ["query"]
        }
    }
}


# 2. The Actual Python Function
# This is the code that runs when the model decides to use the 'web_search' tool.
# It takes the 'query' string provided by the model and returns the search results.
def web_search(query: str) -> str:
    """
    Performs a web search using DuckDuckGo and returns the text content from the results.
    Returns a string with the search results or an error message.
    """
    print(f"--- Performing web search for: '{query}' ---")
    try:
        # We use DuckDuckGo's HTML-only search page because it's simple to parse
        # and less likely to be blocked than Google.
        search_url = f"https://html.duckduckgo.com/html/?q={requests.utils.quote(query)}"
        
        # It's good practice to set a User-Agent header to mimic a web browser.
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        response = requests.get(search_url, headers=headers, timeout=7)
        response.raise_for_status()  # Raise an exception for bad status codes (like 404 or 500)

        # Use BeautifulSoup to parse the HTML content of the search results page.
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all the 'a' tags with the class 'result__snippet'. These contain
        # the short descriptive texts for each search result.
        snippets = [p.get_text(strip=True) for p in soup.find_all('a', class_='result__snippet')]
        
        if not snippets:
            return f"No search results found for the query: '{query}'."
            
        # Join the snippets together and limit the total length to avoid sending
        # too much text back to the model.
        return " ".join(snippets)[:2000]

    except requests.exceptions.RequestException as e:
        print(f"--- Web search failed: {e} ---")
        return f"Error: An exception occurred during the web search: {e}"