export interface AppTheme {
  background: string;
  text: string;
  border: string;
  subtleText: string;
  secondaryBackground: string;
  hoverBackground: string;
  chatBubble: {
    user: string;
    agent: string;
  };
}

export const lightTheme: AppTheme = {
  background: "#d9ecff",
  secondaryBackground: "#EDF6FF",
  text: "#000000",
  border: "#c5d9ec",
  subtleText: "#555555",
  hoverBackground: "#d4e9ff",
  chatBubble: {
    user: "#c7d2fe",
    agent: "#f1f5f9",
  },
};

export const darkTheme: AppTheme = {
  background: "#0d1117",
  secondaryBackground: "#1a1f27",
  text: "#ffffff",
  border: "#30363d",
  subtleText: "#8b949e",
  hoverBackground: "#21262d",
  chatBubble: {
    user: "#4f46e5",
    agent: "#374151",
  },
};
