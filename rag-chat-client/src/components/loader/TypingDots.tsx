// TypingDots.tsx
import styled from "@emotion/styled";

const DotWrapper = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  background-color: #888;
  border-radius: 50%;
  animation: blink 1.2s infinite;

  &:nth-of-type(2) {
    animation-delay: 0.2s;
  }
  &:nth-of-type(3) {
    animation-delay: 0.4s;
  }

  @keyframes blink {
    0%,
    80%,
    100% {
      opacity: 0.2;
    }
    40% {
      opacity: 1;
    }
  }
`;

export const TypingDots = () => (
  <DotWrapper>
    <Dot />
    <Dot />
    <Dot />
  </DotWrapper>
);
