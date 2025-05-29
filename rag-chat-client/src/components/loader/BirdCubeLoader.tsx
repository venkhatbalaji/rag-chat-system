import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

const box1 = keyframes`
  0%, 50% { transform: translate(100%, 0); }
  100% { transform: translate(200%, 0); }
`;

const box2 = keyframes`
  0% { transform: translate(0, 100%); }
  50% { transform: translate(0, 0); }
  100% { transform: translate(100%, 0); }
`;

const box3 = keyframes`
  0%, 50% { transform: translate(100%, 100%); }
  100% { transform: translate(0, 100%); }
`;

const box4 = keyframes`
  0% { transform: translate(200%, 0); }
  50% { transform: translate(200%, 100%); }
  100% { transform: translate(100%, 100%); }
`;

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Boxes = styled.div`
  width: 32px;
  height: 32px;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateX(60deg) rotateZ(45deg) rotateY(0deg) translateZ(0px);
`;

const Box = styled.div<{ index: number }>`
  width: 32px;
  height: 32px;
  position: absolute;
  transform-style: preserve-3d;
  top: 0;
  left: 0;
  animation: ${({ index }) =>
      index === 0 ? box1 : index === 1 ? box2 : index === 2 ? box3 : box4}
    1s linear infinite;
  transform: ${({ index }) =>
    index === 0
      ? "translate(100%, 0)"
      : index === 1
      ? "translate(0, 100%)"
      : index === 2
      ? "translate(100%, 100%)"
      : "translate(200%, 0)"};
`;

const Face = styled.div<{ bg: string; rotate?: string; translateZ?: string }>`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${({ bg }) => bg};
  transform: ${({
    rotate = "rotateY(0deg) rotateX(0deg)",
    translateZ = "15.5px",
  }) => `${rotate} translateZ(${translateZ})`};
`;

const cubeColors = ["#4285F4", "#34A853", "#EA4335", "#FBBC05"];

const BirdCubeLoader = () => {
  return (
    <Wrapper>
      <Boxes>
        {[0, 1, 2, 3].map((i) => (
          <Box key={i} index={i}>
            <Face bg={cubeColors[i % 4]} />
            <Face bg={cubeColors[i % 4]} rotate="rotateY(90deg)" />
            <Face bg={cubeColors[i % 4]} rotate="rotateX(-90deg)" />
            <Face bg="#DBE3F4" translateZ="-90px" />
          </Box>
        ))}
      </Boxes>
    </Wrapper>
  );
};

export default BirdCubeLoader;
