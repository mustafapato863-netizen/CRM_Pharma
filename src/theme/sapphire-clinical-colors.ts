export const sapphireClinicalColors = {
  brand: {
    primary: {
      main: "#3957FF",
      hover: "#2747E8",
      light: "#5B6DFF",
      soft: "#E9EDFF",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#11B7A3",
      hover: "#099583",
      soft: "#DDF9F4",
      contrastText: "#FFFFFF",
    },
  },

  light: {
    background: {
      default: "#F5F7FC",
      paper: "#FFFFFF",
      subtle: "#F8FAFC",
    },

    text: {
      primary: "#111827",
      secondary: "#667085",
    },

    divider: "#E5EAF2",

    action: {
      hover: "#F0F4FF",
      selected: "#E9EDFF",
    },
  },

  dark: {
    background: {
      default: "#0A1020",
      paper: "#111A2D",
      elevated: "#17223A",
      subtle: "#10192B",
    },

    text: {
      primary: "#F6F8FC",
      secondary: "#A7B0C0",
    },

    divider: "#26344F",

    action: {
      hover: "rgba(91, 109, 255, 0.10)",
      selected: "rgba(91, 109, 255, 0.18)",
    },
  },

  semantic: {
    success: {
      light: "#0A9B72",
      dark: "#35C799",
      soft: "#E7F8F2",
    },

    warning: {
      light: "#D98912",
      dark: "#F6B84A",
      soft: "#FFF4DE",
    },

    error: {
      light: "#DC3F52",
      dark: "#F06C7A",
      soft: "#FDECEF",
    },

    info: {
      light: "#3B82F6",
      dark: "#69A7FF",
      soft: "#EAF3FF",
    },

    neutral: {
      light: "#667085",
      dark: "#A7B0C0",
      soft: "#F2F4F7",
    },
  },

  gradients: {
    brand: "linear-gradient(135deg, #3957FF 0%, #5B6DFF 42%, #11B7A3 100%)",

    lightAmbient: `
      radial-gradient(
        circle at 15% 0%,
        rgba(57, 87, 255, 0.15) 0%,
        transparent 34%
      ),
      radial-gradient(
        circle at 85% 8%,
        rgba(17, 183, 163, 0.11) 0%,
        transparent 30%
      )
    `,

    darkAmbient: `
      radial-gradient(
        circle at 12% 0%,
        rgba(72, 96, 255, 0.22) 0%,
        transparent 34%
      ),
      radial-gradient(
        circle at 88% 5%,
        rgba(17, 183, 163, 0.15) 0%,
        transparent 28%
      )
    `,
  },
} as const;
