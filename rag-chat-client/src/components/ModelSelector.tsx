"use client";
import { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { motion, AnimatePresence } from "framer-motion";
import { Check, BrainCircuit, Bot } from "lucide-react";

const Wrapper = styled.div`
  position: relative;
`;

const SelectorButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid #ccc;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Dropdown = styled(motion.div)<{ dropUp: boolean }>`
  position: absolute;
  ${({ dropUp }) => (dropUp ? "bottom: 110%;" : "top: 110%;")}
  left: 0;
  width: 220px;
  background: white;
  border-radius: 12px;
  border: 1px solid #ddd;
  padding: 0.5rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  z-index: 50;
`;

const Option = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  cursor: pointer;
  background: ${({ selected }) => (selected ? "#f3f4f6" : "white")};
  font-weight: ${({ selected }) => (selected ? 600 : 400)};

  &:hover {
    background: #f9fafb;
  }
`;

const models = [
  {
    id: "deep-seek",
    name: "Deep Seek coder",
    desc: "Great for most coding tasks",
    icon: <BrainCircuit size={18} />,
  },
  {
    id: "open-chat",
    name: "o3",
    desc: "Uses advanced reasoning",
    icon: <Bot size={18} />,
  },
];

export const ModelSelector = ({
  onModelChange,
}: {
  onModelChange: (id: string) => void;
}) => {
  const [selected, setSelected] = useState(models[0]);
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Decide drop direction whenever the dropdown opens / on resize
  useEffect(() => {
    if (!open) return;

    const decideDirection = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Need ~250px space: dropdown (220px) + margin
      setDropUp(spaceBelow < 250 && spaceAbove > spaceBelow);
    };

    decideDirection();
    window.addEventListener("resize", decideDirection);
    return () => window.removeEventListener("resize", decideDirection);
  }, [open]);

  const handleSelect = (model: (typeof models)[0]) => {
    setSelected(model);
    onModelChange(model.id);
    setOpen(false);
  };

  return (
    <Wrapper ref={wrapperRef}>
      <SelectorButton onClick={() => setOpen((o) => !o)}>
        {selected.icon}
      </SelectorButton>

      <AnimatePresence>
        {open && (
          <Dropdown
            dropUp={dropUp}
            initial={{ opacity: 0, y: dropUp ? 8 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: dropUp ? 8 : -8 }}
            transition={{ duration: 0.18 }}
          >
            {models.map((m) => (
              <Option
                key={m.id}
                selected={m.id === selected.id}
                onClick={() => handleSelect(m)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {m.icon}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{m.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "#666" }}>
                      {m.desc}
                    </span>
                  </div>
                </div>
                {m.id === selected.id && <Check size={14} />}
              </Option>
            ))}
          </Dropdown>
        )}
      </AnimatePresence>
    </Wrapper>
  );
};
