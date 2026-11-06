import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for parsing working hours via Gemini
  app.post("/api/parse-working-hours", async (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text prompt is required" });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("GEMINI_API_KEY is not defined. Falling back to local parser.");
        const fallbackData = parseHoursLocally(text);
        return res.json(fallbackData);
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an AI assistant for a premium fitness studio named "My Third Space".
Your task is to parse a user's natural language input describing a personal training coach's working schedule/hours, and output a structured JSON schedule for Monday through Sunday.

Rules for parsing:
1. Days of the week must map to keys: "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday".
2. For each day, provide "isWorking" (boolean).
3. If "isWorking" is true, provide "start" and "end" strings formatted as "HH:MM AM/PM" (e.g. "06:00 AM", "02:00 PM", "10:00 AM", "06:30 PM").
4. If "isWorking" is false, set isWorking: false and "start" / "end" to empty strings "".
5. Carefully interpret natural language inputs, e.g.:
   - "Mon to Fri 0600 Am to 0200 PM, Sat 1000 AM to 0200 PM" -> Mon to Fri is 06:00 AM - 02:00 PM, Sat is 10:00 AM - 02:00 PM, Sun is isWorking: false.
   - "same timing for all days" or "Mon to Sat 06:30 AM to 12:30 PM" -> map appropriately.
   
Natural language description: "${text}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              Monday: {
                type: Type.OBJECT,
                properties: {
                  isWorking: { type: Type.BOOLEAN },
                  start: { type: Type.STRING },
                  end: { type: Type.STRING }
                },
                required: ["isWorking", "start", "end"]
              },
              Tuesday: {
                type: Type.OBJECT,
                properties: {
                  isWorking: { type: Type.BOOLEAN },
                  start: { type: Type.STRING },
                  end: { type: Type.STRING }
                },
                required: ["isWorking", "start", "end"]
              },
              Wednesday: {
                type: Type.OBJECT,
                properties: {
                  isWorking: { type: Type.BOOLEAN },
                  start: { type: Type.STRING },
                  end: { type: Type.STRING }
                },
                required: ["isWorking", "start", "end"]
              },
              Thursday: {
                type: Type.OBJECT,
                properties: {
                  isWorking: { type: Type.BOOLEAN },
                  start: { type: Type.STRING },
                  end: { type: Type.STRING }
                },
                required: ["isWorking", "start", "end"]
              },
              Friday: {
                type: Type.OBJECT,
                properties: {
                  isWorking: { type: Type.BOOLEAN },
                  start: { type: Type.STRING },
                  end: { type: Type.STRING }
                },
                required: ["isWorking", "start", "end"]
              },
              Saturday: {
                type: Type.OBJECT,
                properties: {
                  isWorking: { type: Type.BOOLEAN },
                  start: { type: Type.STRING },
                  end: { type: Type.STRING }
                },
                required: ["isWorking", "start", "end"]
              },
              Sunday: {
                type: Type.OBJECT,
                properties: {
                  isWorking: { type: Type.BOOLEAN },
                  start: { type: Type.STRING },
                  end: { type: Type.STRING }
                },
                required: ["isWorking", "start", "end"]
              }
            },
            required: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
          }
        }
      });

      let textResponse = response.text || "{}";
      if (textResponse.includes("```")) {
        textResponse = textResponse.replace(/```json|```/g, "").trim();
      }
      const parsedData = JSON.parse(textResponse);
      res.json(parsedData);
    } catch (err: any) {
      console.error("Gemini Parse Error, calling local fallback parser:", err);
      try {
        const fallbackData = parseHoursLocally(text);
        res.json(fallbackData);
      } catch (fallbackErr) {
        console.error("Local fallback parse error:", fallbackErr);
        res.status(500).json({ error: "Failed to parse working hours" });
      }
    }
  });

  // Helper to parse working hours locally using regex and pattern matching as a robust fallback
  function parseHoursLocally(text: string) {
    const schedule: any = {
      Monday: { isWorking: false, start: "", end: "" },
      Tuesday: { isWorking: false, start: "", end: "" },
      Wednesday: { isWorking: false, start: "", end: "" },
      Thursday: { isWorking: false, start: "", end: "" },
      Friday: { isWorking: false, start: "", end: "" },
      Saturday: { isWorking: false, start: "", end: "" },
      Sunday: { isWorking: false, start: "", end: "" }
    };

    const daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayPatterns = [
      { name: "Monday", search: ["monday", "mon"] },
      { name: "Tuesday", search: ["tuesday", "tue"] },
      { name: "Wednesday", search: ["wednesday", "wed"] },
      { name: "Thursday", search: ["thursday", "thu"] },
      { name: "Friday", search: ["friday", "fri"] },
      { name: "Saturday", search: ["saturday", "sat"] },
      { name: "Sunday", search: ["sunday", "sun"] }
    ];

    const lower = text.toLowerCase();

    const extractTimes = (segment: string): string[] => {
      // 1. First, search for matches with explicit am/pm
      // e.g., "9am", "9:30 am", "0600 Am", "0200 PM"
      const withAmPmRegex = /(\d{1,2}):?(\d{2})?\s*([ap]m)/gi;
      const times: string[] = [];
      let match;
      while ((match = withAmPmRegex.exec(segment)) !== null) {
        let hh = parseInt(match[1], 10);
        // Handle 3 or 4 digit format like 0600 or 1400 without colons but with am/pm
        let mm = 0;
        if (match[2]) {
          mm = parseInt(match[2], 10);
        } else if (match[1].length >= 3) {
          const rawVal = match[1];
          if (rawVal.length === 3) {
            hh = parseInt(rawVal.substring(0, 1), 10);
            mm = parseInt(rawVal.substring(1), 10);
          } else {
            hh = parseInt(rawVal.substring(0, 2), 10);
            mm = parseInt(rawVal.substring(2), 10);
          }
        }
        const period = match[3].toUpperCase();
        // Standardize hours
        if (hh > 12) {
          hh = hh % 12;
          if (hh === 0) hh = 12;
        }
        const hhStr = hh.toString().padStart(2, "0");
        const mmStr = mm.toString().padStart(2, "0");
        times.push(`${hhStr}:${mmStr} ${period}`);
      }

      if (times.length >= 2) return times;

      // 2. Search for 24-hour style times with colons (e.g., "14:00", "09:30", "18:30")
      const hr24Regex = /(\d{1,2}):(\d{2})/g;
      const times24: string[] = [];
      let match24;
      while ((match24 = hr24Regex.exec(segment)) !== null) {
        let hh = parseInt(match24[1], 10);
        const mm = parseInt(match24[2], 10);
        let period = "AM";
        if (hh >= 12) {
          period = "PM";
          if (hh > 12) hh -= 12;
        } else if (hh === 0) {
          hh = 12;
        }
        const hhStr = hh.toString().padStart(2, "0");
        const mmStr = mm.toString().padStart(2, "0");
        times24.push(`${hhStr}:${mmStr} ${period}`);
      }

      if (times24.length >= 2) return times24;

      // 3. Try to search for raw numbers like "9 to 5", "10 to 6"
      const rawNumRegex = /\b(\d{1,2})\b/g;
      const rawNums: number[] = [];
      let matchNum;
      while ((matchNum = rawNumRegex.exec(segment)) !== null) {
        rawNums.push(parseInt(matchNum[1], 10));
      }
      if (rawNums.length >= 2) {
        const timesRaw: string[] = [];
        for (let i = 0; i < 2; i++) {
          let hh = rawNums[i];
          let period = "AM";
          // If first hour is 9 (am) and second is 5, 5 is likely PM
          if (i === 1 && hh < rawNums[0] && hh <= 11) {
            period = "PM";
          } else if (hh >= 12) {
            period = "PM";
            if (hh > 12) hh -= 12;
          } else if (hh >= 11 && i === 1) {
            period = "PM";
          } else if (hh < 8 && i === 1) {
            period = "PM";
          }
          const hhStr = hh.toString().padStart(2, "0");
          timesRaw.push(`${hhStr}:00 ${period}`);
        }
        return timesRaw;
      }

      return times;
    };

    if (lower.includes("everyday") || lower.includes("all days") || lower.includes("daily") || lower.includes("each day")) {
      const times = extractTimes(lower);
      if (times.length >= 2) {
        const start = times[0];
        const end = times[1];
        for (const day of dayPatterns) {
          schedule[day.name] = { isWorking: true, start, end };
        }
        return schedule;
      }
    }

    const clauses = lower.split(/,|\band\b|;|\bor\b/g);
    for (const clause of clauses) {
      const trimmed = clause.trim();
      if (!trimmed) continue;

      const times = extractTimes(trimmed);
      if (times.length < 2) continue;

      const start = times[0];
      const end = times[1];

      const activeDays = new Set<string>();
      let foundRange = false;
      const rangeRegex = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\s*(?:to|through|till|-|—)\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)/gi;
      let rangeMatch;

      while ((rangeMatch = rangeRegex.exec(trimmed)) !== null) {
        const startDayStr = rangeMatch[1];
        const endDayStr = rangeMatch[2];

        const startDayObj = dayPatterns.find(d => d.search.includes(startDayStr));
        const endDayObj = dayPatterns.find(d => d.search.includes(endDayStr));

        if (startDayObj && endDayObj) {
          const startIndex = daysList.indexOf(startDayObj.name);
          const endIndex = daysList.indexOf(endDayObj.name);

          if (startIndex !== -1 && endIndex !== -1) {
            foundRange = true;
            if (startIndex <= endIndex) {
              for (let i = startIndex; i <= endIndex; i++) {
                activeDays.add(daysList[i]);
              }
            } else {
              for (let i = startIndex; i < daysList.length; i++) {
                activeDays.add(daysList[i]);
              }
              for (let i = 0; i <= endIndex; i++) {
                activeDays.add(daysList[i]);
              }
            }
          }
        }
      }

      if (!foundRange) {
        for (const dp of dayPatterns) {
          for (const s of dp.search) {
            const regex = new RegExp(`\\b${s}\\b`, 'i');
            if (regex.test(trimmed)) {
              activeDays.add(dp.name);
              break;
            }
          }
        }
      }

      for (const day of activeDays) {
        schedule[day] = { isWorking: true, start, end };
      }
    }

    const workingDaysCount = Object.values(schedule).filter((d: any) => d.isWorking).length;
    if (workingDaysCount === 0) {
      const times = extractTimes(lower);
      if (times.length >= 2) {
        const start = times[0];
        const end = times[1];
        const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        for (const day of weekdays) {
          schedule[day] = { isWorking: true, start, end };
        }
      }
    }

    return schedule;
  }

  // Serve static files / public directly if needed
  app.use("/public", express.static(path.join(process.cwd(), "public")));

  // Express + Vite dev server routing:
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
