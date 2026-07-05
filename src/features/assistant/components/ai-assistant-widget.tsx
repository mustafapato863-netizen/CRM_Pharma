"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ChatRounded,
  CloseRounded,
  SendRounded,
  SettingsRounded,
  SmartToyRounded,
  HelpOutlineRounded,
} from "@mui/icons-material";
import { SYSTEM_FAQ, FAQItem } from "../faq/system-faq";
import { SYSTEM_SUMMARY } from "../faq/system-summary";
import { askAssistantAction } from "../actions/assistant-actions";
import { useLocale } from "next-intl";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
};

function findOfflineAnswer(prompt: string, isAr: boolean): string | null {
  const cleanPrompt = prompt.toLowerCase().trim();
  
  // Clean arabic text from accents (tashkeel/diacritics) and simplify some letters
  const cleanArabic = (text: string) => {
    return text
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/[\u064B-\u065F]/g, "") // remove tashkeel
      .toLowerCase()
      .trim();
  };

  const cleanUserPrompt = isAr ? cleanArabic(cleanPrompt) : cleanPrompt;

  for (const item of SYSTEM_FAQ) {
    const q = isAr ? cleanArabic(item.questionAr) : item.question.toLowerCase().trim();
    // 1. Exact match
    if (cleanUserPrompt === q) {
      return isAr ? item.answerAr : item.answer;
    }
    
    // 2. Fuzzy keywords containment (e.g., if prompt contains "اضافة" and "منتج" or "add" and "product")
    const keywords = q.split(/\s+/).filter(w => w.length > 2);
    if (keywords.length > 0) {
      const matched = keywords.every(kw => cleanUserPrompt.includes(kw));
      if (matched) {
        return isAr ? item.answerAr : item.answer;
      }
    }
  }
  
  // Specific fallbacks
  if (isAr) {
    if (cleanUserPrompt.includes("اضاف") && (cleanUserPrompt.includes("منتج") || cleanUserPrompt.includes("دواء") || cleanUserPrompt.includes("صنف"))) {
      return SYSTEM_FAQ[0].answerAr;
    }
    if (cleanUserPrompt.includes("فاتور") && (cleanUserPrompt.includes("مبيعات") || cleanUserPrompt.includes("بيع") || cleanUserPrompt.includes("عميل"))) {
      return SYSTEM_FAQ[1].answerAr;
    }
    if (cleanUserPrompt.includes("ارباح") || cleanUserPrompt.includes("ربح") || cleanUserPrompt.includes("مكسب")) {
      return SYSTEM_FAQ[2].answerAr;
    }
    if (cleanUserPrompt.includes("صلاحي") || cleanUserPrompt.includes("منتهي") || cleanUserPrompt.includes("اكسباير")) {
      return SYSTEM_FAQ[3].answerAr;
    }
    if (cleanUserPrompt.includes("رصيد") || cleanUserPrompt.includes("حساب") || cleanUserPrompt.includes("ديون") || cleanUserPrompt.includes("مديون")) {
      return SYSTEM_FAQ[4].answerAr;
    }
  } else {
    if (cleanUserPrompt.includes("add") && (cleanUserPrompt.includes("product") || cleanUserPrompt.includes("medicine") || cleanUserPrompt.includes("item"))) {
      return SYSTEM_FAQ[0].answer;
    }
    if (cleanUserPrompt.includes("sale") || cleanUserPrompt.includes("invoice")) {
      return SYSTEM_FAQ[1].answer;
    }
    if (cleanUserPrompt.includes("profit") || cleanUserPrompt.includes("margin") || cleanUserPrompt.includes("earn")) {
      return SYSTEM_FAQ[2].answer;
    }
    if (cleanUserPrompt.includes("expiry") || cleanUserPrompt.includes("expire")) {
      return SYSTEM_FAQ[3].answer;
    }
    if (cleanUserPrompt.includes("balance") || cleanUserPrompt.includes("owe") || cleanUserPrompt.includes("supplier") || cleanUserPrompt.includes("customer")) {
      return SYSTEM_FAQ[4].answer;
    }
  }

  return null;
}

export function AIAssistantWidget() {
  const locale = useLocale();
  const isAr = locale === "ar";
  
  // Drawer/Chat Window visibility
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: isAr
        ? "مرحباً بك! أنا مساعدك الذكي للصيدلية. كيف يمكنني مساعدتك اليوم؟ يمكنك اختيار سؤال سريع من الأسفل أو سؤالي مباشرة."
        : "Hello! I am your Pharmacy CRM AI Guide. How can I help you today? You can select a quick FAQ below or ask me anything directly.",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Settings for API Key
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiProvider, setApiProvider] = useState<"gemini" | "openai">("gemini");
  const [apiKey, setApiKey] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API Keys from localStorage on mount
  useEffect(() => {
    const savedProvider = localStorage.getItem("pharmacy_ai_provider");
    const savedKey = localStorage.getItem("pharmacy_ai_key");
    if (savedProvider === "openai" || savedProvider === "gemini") {
      setApiProvider(savedProvider);
    }
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save Settings Helper
  const saveSettings = () => {
    localStorage.setItem("pharmacy_ai_provider", apiProvider);
    localStorage.setItem("pharmacy_ai_key", apiKey);
    setSettingsOpen(false);
  };

  // Scroll to bottom helper
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Handle FAQ Quick Button Click (Zero latency answer)
  const handleFAQClick = (item: FAQItem) => {
    const userQ: Message = {
      id: `q-${Date.now()}`,
      sender: "user",
      text: isAr ? item.questionAr : item.question,
      timestamp: new Date(),
    };

    const botA: Message = {
      id: `a-${Date.now()}`,
      sender: "bot",
      text: isAr ? item.answerAr : item.answer,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userQ, botA]);
  };

  // Call API for AI Generation
  const callAI = async (prompt: string, history: Message[]) => {
    // 1. Try server-side action first (reading .env key)
    const formattedHistory = history.map((m) => ({ sender: m.sender, text: m.text }));
    const serverResult = await askAssistantAction(prompt, formattedHistory);
    
    if (serverResult.success && serverResult.text) {
      return serverResult.text;
    }

    // 2. If server-side key is not set, fallback to user's client key if saved in settings
    const systemKeyMissing = !serverResult.success && (
      serverResult.error?.includes("غير متاح") || 
      serverResult.error?.includes("env")
    );

    if (systemKeyMissing) {
      if (!apiKey) {
        return isAr
          ? "عذراً! لم تقم بتكوين مفتاح API الخاص بالذكاء الاصطناعي بعد. يرجى النقر على أيقونة الإعدادات في الأعلى لإضافة مفتاحك (Gemini أو OpenAI). في غضون ذلك، يمكنك النقر على الأسئلة الشائعة بالأسفل للتعلم!"
          : "Sorry! You haven't configured your AI API Key yet. Please click the Settings icon at the top to add your API Key (Gemini or OpenAI). Meanwhile, feel free to use the quick FAQ buttons below!";
      }

      try {
        if (apiProvider === "gemini") {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: SYSTEM_SUMMARY },
                    { text: `Previous conversation history:\n${history.map((m) => `${m.sender}: ${m.text}`).join("\n")}` },
                    { text: `User Question: ${prompt}` },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.3,
              },
            }),
          });

          if (!response.ok) {
            throw new Error(isAr ? "فشل الاتصال بـ Gemini API. تأكد من صحة المفتاح." : "Failed to connect to Gemini API. Please check your key.");
          }

          const data = await response.json();
          return data.candidates?.[0]?.content?.parts?.[0]?.text || (isAr ? "لم أستطع معالجة السؤال." : "Unable to process the request.");
        } else {
          // OpenAI Integration
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: SYSTEM_SUMMARY },
                ...history.map((m) => ({
                  role: m.sender === "user" ? "user" : "assistant",
                  content: m.text,
                })),
                { role: "user", content: prompt },
              ],
              temperature: 0.3,
            }),
          });

          if (!response.ok) {
            throw new Error(isAr ? "فشل الاتصال بـ OpenAI API. تأكد من صحة المفتاح." : "Failed to connect to OpenAI API. Please check your key.");
          }

          const data = await response.json();
          return data.choices?.[0]?.message?.content || (isAr ? "لم أستطع معالجة السؤال." : "Unable to process the request.");
        }
      } catch (err: any) {
        console.error(err);
        return err.message || (isAr ? "حدث خطأ غير متوقع." : "An unexpected error occurred.");
      }
    }

    // Return the server-side error if it failed for reasons other than key absence
    return serverResult.error || (isAr ? "فشل الاتصال بالخادم." : "Server connection failed.");
  };

  // Handle Send Message
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // Check for offline FAQ match to save tokens
    const offlineAnswer = findOfflineAnswer(text, isAr);
    if (offlineAnswer) {
      setIsLoading(true);
      setTimeout(() => {
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: offlineAnswer,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsLoading(false);
      }, 400);
      return;
    }

    setIsLoading(true);

    const botResponseText = await callAI(text, messages);
    
    const botMsg: Message = {
      id: `bot-${Date.now()}`,
      sender: "bot",
      text: botResponseText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsLoading(false);
  };

  return (
    <>
      {/* 1. Floating Action Button (FAB) */}
      <Fab
        color="primary"
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: "fixed",
          bottom: { xs: 16, sm: 24 },
          right: isAr ? "auto" : { xs: 16, sm: 24 },
          left: isAr ? { xs: 16, sm: 24 } : "auto",
          zIndex: 1100,
          backgroundImage: "linear-gradient(135deg, var(--mui-palette-primary-main), var(--mui-palette-secondary-main))",
          boxShadow: "0 6px 20px rgba(0,0,0,0.15), 0 0 10px rgba(var(--mui-palette-primary-main-channel), 0.3)",
          transition: "transform 200ms ease, box-shadow 200ms ease",
          "&:hover": {
            transform: "scale(1.05) rotate(5deg)",
          },
        }}
      >
        {isOpen ? <CloseRounded /> : <ChatRounded />}
      </Fab>

      {/* 2. Interactive Responsive Chat Window */}
      {isOpen && (
        <Paper
          variant="glass"
          sx={{
            position: "fixed",
            bottom: { xs: 80, sm: 96 },
            right: isAr ? "auto" : { xs: 16, sm: 24 },
            left: isAr ? { xs: 16, sm: 24 } : "auto",
            width: { xs: "calc(100vw - 32px)", sm: 380, md: 420 },
            height: { xs: "calc(80dvh - 90px)", sm: 540, md: 600 },
            maxHeight: 700,
            zIndex: 1100,
            borderRadius: 3.5,
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.16)",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
            animation: "fadeInUp 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            "@keyframes fadeInUp": {
              from: { opacity: 0, transform: "translateY(20px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {/* Header Banner */}
          <Box
            sx={{
              p: 2,
              backgroundImage:
                "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-primary-main) 12%, transparent), color-mix(in srgb, var(--mui-palette-secondary-main) 6%, transparent))",
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Avatar sx={{ bgcolor: "primary.main", color: "white", width: 38, height: 38 }}>
                <SmartToyRounded />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 850 }}>
                  {isAr ? "المساعد الذكي للصيدلية" : "Pharmacy AI Guide"}
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 800 }}>
                  ● {isAr ? "متصل ومستعد" : "Online & ready"}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={() => setSettingsOpen(true)} title="AI Settings">
                <SettingsRounded fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => setIsOpen(false)}>
                <CloseRounded fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* Messages List Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: "action.hover",
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius:
                      msg.sender === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                    bgcolor: msg.sender === "user" ? "primary.main" : "background.paper",
                    color: msg.sender === "user" ? "primary.contrastText" : "text.primary",
                    borderColor: msg.sender === "user" ? "primary.main" : "divider",
                  }}
                >
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.45 }}>
                      {msg.text}
                    </Typography>
                  </CardContent>
                </Card>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    textAlign: msg.sender === "user" ? "right" : "left",
                    fontSize: "0.68rem",
                  }}
                >
                  {msg.timestamp.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                </Typography>
              </Box>
            ))}

            {isLoading && (
              <Box sx={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  {isAr ? "يفكر..." : "Thinking..."}
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Quick FAQ Suggestion Chips */}
          <Box
            sx={{
              p: 1.5,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              overflowX: "auto",
              whiteSpace: "nowrap",
              display: "flex",
              gap: 1,
              "&::-webkit-scrollbar": { display: "none" }, // hide scrollbar
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <HelpOutlineRounded fontSize="small" color="action" />
              {SYSTEM_FAQ.map((item) => (
                <Chip
                  key={item.question}
                  label={isAr ? item.questionAr : item.question}
                  size="small"
                  onClick={() => handleFAQClick(item)}
                  sx={{ cursor: "pointer", fontWeight: 700 }}
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>

          {/* Input text send area */}
          <Box
            sx={{
              p: 1.5,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder={isAr ? "اكتب سؤالك هنا..." : "Ask your question here..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleSend} disabled={isLoading}>
                          <SendRounded fontSize="small" color="primary" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>
          </Box>
        </Paper>
      )}

      {/* 3. API Key Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 850 }}>
          {isAr ? "إعدادات مساعد الذكاء الاصطناعي" : "AI Assistant Settings"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ py: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {isAr
                ? "لتشغيل المساعد الذكي الكامل للرد على الأسئلة المفتوحة، يرجى حفظ مفتاح الـ API الخاص بك. يتم حفظ المفتاح بأمان محلياً في متصفحك فقط."
                : "To unlock full open-ended AI guide replies, please save your API Key. The key is securely saved locally in your browser storage only."}
            </Typography>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                {isAr ? "مزود الذكاء الاصطناعي" : "AI Provider"}
              </Typography>
              <RadioGroup
                row
                value={apiProvider}
                onChange={(e) => setApiProvider(e.target.value as "gemini" | "openai")}
              >
                <FormControlLabel value="gemini" control={<Radio />} label="Gemini API (Recommended/Free)" />
                <FormControlLabel value="openai" control={<Radio />} label="OpenAI API" />
              </RadioGroup>
            </Box>

            <TextField
              fullWidth
              type="password"
              label={isAr ? "مفتاح الـ API Key" : "API Key"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                apiProvider === "gemini"
                  ? "AIzaSy..."
                  : "sk-proj-..."
              }
              helperText={
                apiProvider === "gemini" ? (
                  <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                    {isAr ? (
                      <>
                        يمكنك الحصول على مفتاح مجاني من{" "}
                        <a
                          href="https://aistudio.google.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--mui-palette-primary-main)" }}
                        >
                          Google AI Studio
                        </a>
                      </>
                    ) : (
                      <>
                        Get a free Gemini key from{" "}
                        <a
                          href="https://aistudio.google.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--mui-palette-primary-main)" }}
                        >
                          Google AI Studio
                        </a>
                      </>
                    )}
                  </Typography>
                ) : (
                  isAr ? "أدخل مفتاح OpenAI الخاص بحسابك الممول." : "Enter your funded OpenAI billing account key."
                )
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)} color="inherit">
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button onClick={saveSettings} variant="contained">
            {isAr ? "حفظ الإعدادات" : "Save Settings"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
