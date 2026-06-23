import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useTheme } from "@/providers/ThemeProvider";


