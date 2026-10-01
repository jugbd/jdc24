---
id: "2025-context-engineering"
eventId: "jdc-2025"
order: 1
status: "announced"
title: "Context Engineering with Java and DuckDB"
track: "Technical"
speakerIds: ["2025-mahmudur-r-manna"]
tags: ["Spring AI", "DuckDB", "Vector Search", "LLM Engineering"]
---

Now that LLMs dominate headlines, what is the Java developer’s role? An LLM is an ocean of knowledge with occasional illusions. It does not know your business rules, policies, or transaction semantics. If you want it to help real accountants or domain experts, you must supply your context and the reasoning over that context. That is context engineering.

Just as an RDBMS holds application metadata, LLM applications need two additional stores. A Graph DB captures relationships and policy scope: parent, sibling, neighbor, depth. A Vector DB holds domain documents and records for semantic retrieval. For any goal, you assemble the right facts and the reasoning path, then feed both to the model.

In this session we build a thin Context ORM in Java that can parse domain documents, index entities and relationships into a Graph DB, embed documents and records into a Vector DB, and provide a retrieval mechanism that stitches the right context and reasoning into prompts. We use Spring AI, DuckDB with vector search, and a small business domain with dummy data. You will see how to ground answers in your rules, test them, audit them, and make LLM output reliable for real work.
