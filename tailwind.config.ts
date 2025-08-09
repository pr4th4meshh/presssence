// import { default as flattenColorPalette } from "tailwindcss/lib/util/flattenColorPalette";
const {
  default: flattenColorPalette,
// eslint-disable-next-line @typescript-eslint/no-require-imports
} = require("tailwindcss/lib/util/flattenColorPalette");

import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
  	extend: {
  		colors: {
  			background: ' var(--background)',
  			foreground: ' var(--foreground)',
  			light: '#e6e6e6',
  			dark: '#000000',
  			card: {
  				DEFAULT: ' var(--card)',
  				foreground: ' var(--card-foreground)'
  			},
  			popover: {
  				DEFAULT: ' var(--popover)',
  				foreground: ' var(--popover-foreground)'
  			},
  			primary: {
  				DEFAULT: ' var(--primary)',
  				foreground: ' var(--primary-foreground)'
  			},
  			secondary: {
  				DEFAULT: ' var(--secondary)',
  				foreground: ' var(--secondary-foreground)'
  			},
  			muted: {
  				DEFAULT: ' var(--muted)',
  				foreground: ' var(--muted-foreground)'
  			},
  			accent: {
  				DEFAULT: ' var(--accent)',
  				foreground: ' var(--accent-foreground)'
  			},
  			destructive: {
  				DEFAULT: ' var(--destructive)',
  				foreground: ' var(--destructive-foreground)'
  			},
  			border: ' var(--border)',
  			input: ' var(--input)',
  			ring: ' var(--ring)',
  			chart: {
  				'1': ' var(--chart-1)',
  				'2': ' var(--chart-2)',
  				'3': ' var(--chart-3)',
  				'4': ' var(--chart-4)',
  				'5': ' var(--chart-5)'
  			}
  		},
  		animation: {
  			aurora: 'aurora 10s linear infinite'
  		},
  		keyframes: {
  			aurora: {
  				from: {
  					backgroundPosition: '50% 50%, 50% 50%'
  				},
  				to: {
  					backgroundPosition: '350% 50%, 350% 50%'
  				}
  			}
  		},
  	}
  },
  plugins: [addVariablesForColors, require("tailwindcss-animate")],
} satisfies Config;

function addVariablesForColors({ addBase, theme }: any) {
  const allColors = flattenColorPalette(theme("colors"));
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
 
  addBase({
    ":root": newVars,
  });
}
