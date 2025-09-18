// src/data/dummyData.js

export const dummyReports = {
  101: { // Corresponds to Priya Sharma (Selected)
    score: 92,
    summary: "An exceptional candidate with deep practical and theoretical knowledge of Excel. Demonstrates quick problem-solving skills and clear communication. Highly recommended for the final round.",
    strengths: "- Immediately identified the optimal formula (SUMIFS) for the worksheet task.\n- Articulated a strong, clear understanding of advanced topics like INDEX-MATCH vs. VLOOKUP.\n- Showed confidence and provided detailed, textbook-correct answers.",
    weaknesses: "- No significant weaknesses were identified during this screening. Could be probed on VBA/Macros in a subsequent round if required for the role."
  },
  102: { // Corresponds to Rahul Kumar (Rejected)
    score: 58,
    summary: "Candidate possesses very basic knowledge but struggles significantly with practical application and articulating concepts beyond surface-level definitions.",
    strengths: "- Was able to define what a basic formula is.",
    weaknesses: "- Unable to solve the worksheet task, did not know which function to use.\n- Confused about the purpose and application of VLOOKUP.\n- Could not explain data cleaning or summarization techniques like PivotTables."
  },
  103: { // Corresponds to Anjali Singh (Interviewed)
    score: 78,
    summary: "A good candidate with solid foundational skills. She is capable and knowledgeable but lacks some confidence and speed when dealing with more advanced, multi-step problems.",
    strengths: "- Good grasp of PivotTables and data summarization techniques.\n- Communicated her thought process well, even when uncertain.\n- Arrived at the correct answer for the worksheet task, albeit with a less efficient method.",
    weaknesses: "- Hesitated when asked about complex, nested formulas (e.g., text manipulation).\n- Could improve the efficiency of her problem-solving approach."
  }
};

export const dummyTranscripts = {
  101: [ // Priya Sharma (Selected)
    { type: 'ai', speaker: 'AI', text: "Hello Priya. Let's start with a scenario. You have a sales data sheet with columns for Date, Region, and Sales Amount. How would you find the total sales for the 'North' region in the month of January?" },
    { type: 'user', speaker: 'Priya Sharma', text: "I'd use the SUMIFS function. The formula would be something like =SUMIFS(Sales_Column, Region_Column, \"North\", Date_Column, \">=2024-01-01\", Date_Column, \"<=2024-01-31\"). It's efficient for multiple criteria." },
    { type: 'ai', speaker: 'AI', text: "That is the optimal answer. Perfect. How is INDEX-MATCH more flexible than VLOOKUP?" },
    { type: 'user', speaker: 'Priya Sharma', text: "VLOOKUP is limited to searching in the first column and looking right. INDEX-MATCH is more dynamic; it can perform lookups in any direction—left, right, up, or down—and it's less prone to errors if columns are inserted or deleted." }
  ],
  102: [ // Rahul Kumar (Rejected)
    { type: 'ai', speaker: 'AI', text: "Hello Rahul. What is a VLOOKUP function used for?" },
    { type: 'user', speaker: 'Rahul Kumar', text: "It's for... looking up data. From another table. I think you use it to find a name or something." },
    { type: 'ai', speaker: 'AI', text: "Can you give an example?" },
    { type: 'user', speaker: 'Rahul Kumar', text: "I haven't used it much recently, I'm not sure of the exact parts of the formula." }
  ],
  103: [ // Anjali Singh (Interviewed)
    { type: 'ai', speaker: 'AI', text: "Hello Anjali. How would you approach the worksheet task to find the total revenue for 'Technology'?" },
    { type: 'user', speaker: 'Anjali Singh', text: "Okay, I see the data. I would first apply a filter to the 'Category' column and select only 'Technology'. Then, I would select all the visible cells in the 'Revenue' column, and Excel's status bar at the bottom would show me the sum." },
    { type: 'ai', speaker: 'AI', text: "That works. Is there a formula-based way to do it without filtering?" },
    { type: 'user', speaker: 'Anjali Singh', text: "Oh, right. I could use a SUMIF function. It would be =SUMIF(Category_Column, \"Technology\", Revenue_Column). That would be faster." }
  ],
};