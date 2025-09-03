import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../endpoints/endpoints";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import "./AnnouncementBanner.css"; // Import the new CSS for marquee

const AnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/announcement/active`);
        // Backend returns { success, data: [...] }
        if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setAnnouncement(res.data.data[0]);
        } else {
          setAnnouncement(null);
        }
      } catch (err) {
        setAnnouncement(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncement();
  }, []);

  if (loading) return null;

  const AnnouncementContent = () => (
    <span className="flex items-center space-x-3 text-white/90 font-medium text-sm tracking-wide">
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-5 h-5 text-emerald-300" />
      </motion.div>
      <span className="bg-gradient-to-r from-emerald-200 to-cyan-200 bg-clip-text text-transparent font-semibold">
        {announcement ? announcement.title + ": " + announcement.message : "No announcement at this time."}
      </span>
    </span>
  );

  return (
    <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-r from-teal-900 via-teal-900 to-teal-900 overflow-hidden z-20 border-b border-teal-500/20">
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-teal-400 rounded-full"
            animate={{
              x: [0, window.innerWidth || 1200],
              y: [Math.random() * 56, Math.random() * 56],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
      
      <div className="relative flex items-center h-full">
        <div className="marquee-content whitespace-nowrap">
          <div className="flex items-center space-x-8 px-8"><AnnouncementContent /></div>
          <div className="flex items-center space-x-8 px-8"><AnnouncementContent /></div>
          <div className="flex items-center space-x-8 px-8"><AnnouncementContent /></div>
          <div className="flex items-center space-x-8 px-8"><AnnouncementContent /></div>
        </div>
      </div>
      
      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent"></div>
    </div>
  );
};

export default AnnouncementBanner;