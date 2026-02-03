export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const { message, systemPrompt } = req.body || {};
    if (!message) {
        return res.status(400).json({ error: "Missing message" });
    }

    const payload = {
        contents: [{ role: "user", parts: [{ text: message }] }]
    };

    if (systemPrompt) {
        payload.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            let errorMessage = `Gemini API error: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage += ` - ${errorData.error?.message || JSON.stringify(errorData)}`;
            } catch {
                const errorText = await response.text();
                if (errorText) {
                    errorMessage += ` - ${errorText}`;
                }
            }
            return res.status(response.status).json({ error: errorMessage });
        }

        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return res.status(200).json({ replyText });
    } catch (error) {
        return res.status(500).json({ error: error.message || "Unexpected error" });
    }
}
