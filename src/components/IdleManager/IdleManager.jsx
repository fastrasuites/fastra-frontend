// components/IdleManager.jsx
import React, { useEffect, useState } from "react";
import IdleTimerService from "../../services/IdleTimerService";
import IdleWarningModal from "./IdleWarningModal";

const IdleManager = () => {
  const [showIdleModal, setShowIdleModal] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    IdleTimerService.setupIdleTimer({
      onCountdown: () => {
        setShowIdleModal(true);
        setSecondsLeft(60);

        const id = setInterval(() => {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              clearInterval(id);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setIntervalId(id);
      },
      onLogout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        clearInterval(intervalId);
        setShowIdleModal(false);
        window.location.href = "/login";
      },
    });

    return () => {
      IdleTimerService.clearIdleTimer();
      clearInterval(intervalId);
    };
  }, []);

  const handleStayLoggedIn = () => {
    localStorage.setItem("last_activity_time", Date.now().toString());
    setShowIdleModal(false);
    clearInterval(intervalId);
  };

  return (
    <IdleWarningModal
      open={showIdleModal}
      secondsLeft={secondsLeft}
      onStayLoggedIn={handleStayLoggedIn}
    />
  );
};

export default IdleManager;
