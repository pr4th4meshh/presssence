// import jwt from 'jsonwebtoken'

// const SECRET_KEY = process.env.JWT_SECRET!

// export function generateToken(userId: string): string {
//   return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '1d' })
// }

// export function verifyToken(token: string): { userId: string } | null {
//   try {
//     return jwt.verify(token, SECRET_KEY) as { userId: string }
//   } catch (error) {
//     return null
//   }
// }