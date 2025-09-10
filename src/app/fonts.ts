import "@fontsource/lexend-deca"; // Defaults to weight 400
import "@fontsource/lexend-deca/400.css"; // Specify weight
import "@fontsource/lexend-deca/400-italic.css"; // Specify weight and style
import "@fontsource/inter"; // Defaults to weight 400
import "@fontsource/inter/400.css"; // Specify weight
import "@fontsource/inter/400-italic.css"; // Specify weight and style
import { Inter, Lexend_Deca } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const lexendDeca = Lexend_Deca({
  subsets: ['latin'],
  variable: '--font-lexend',
});
