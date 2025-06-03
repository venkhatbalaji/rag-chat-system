"use client";
import { useState } from "react";
import styled from "@emotion/styled";
import { motion, AnimatePresence } from "framer-motion";
import { Check, BrainCircuit, Bot } from "lucide-react";

const Wrapper = styled.div`
  position: relative;
  margin-right: 0.75rem;
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
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.04);
  }
`;

const Dropdown = styled(motion.div)`
  position: absolute;
  top: 130%;
  left: 0;
  background: white;
  border-radius: 12px;
  border: 1px solid #ddd;
  padding: 0.5rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  width: 220px;
  z-index: 999;
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
  color: #333;

  &:hover {
    background: #f9fafb;
  }

  .label {
    display: flex;
    flex-direction: column;
    margin-left: 0.6rem;
  }

  .title {
    font-size: 0.95rem;
  }

  .desc {
    font-size: 0.75rem;
    color: #666;
  }
`;

const models = [
  {
    id: "deep-seek",
    name: "Deep Seek coder",
    desc: "Great for most coding tasks",
    icon: <BrainCircuit size={20} />,
  },
  {
    id: "open-chat",
    name: "o3",
    desc: "Uses advanced reasoning",
    icon: <Bot size={20} />,
  },
];

export const ModelSelector = ({
  onModelChange,
}: {
  onModelChange: (id: string) => void;
}) => {
  const [selected, setSelected] = useState(models[0]);
  const [open, setOpen] = useState(false);

  const handleSelect = (model: (typeof models)[0]) => {
    setSelected(model);
    setOpen(false);
    onModelChange(model.id);
  };

  return (
    <Wrapper>
      <SelectorButton onClick={() => setOpen((o) => !o)}>
        {selected.icon}
      </SelectorButton>

      <AnimatePresence>
        {open && (
          <Dropdown
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {models.map((model) => (
              <Option
                key={model.id}
                selected={model.id === selected.id}
                onClick={() => handleSelect(model)}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  {model.icon}
                  <div className="label">
                    <span className="title">{model.name}</span>
                    <span className="desc">{model.desc}</span>
                  </div>
                </div>
                {model.id === selected.id && <Check size={16} />}
              </Option>
            ))}
          </Dropdown>
        )}
      </AnimatePresence>
    </Wrapper>
  );
};
