import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();
const SECRET_KEY = "my-secret"; // 실제 서비스에서는 .env 로 관리하세요

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(bodyParser.json());

// Mock 사용자 데이터
const users = [
  { id: 1, username: "admin", password: "1234" },
  { id: 2, username: "test", password: "1234" },
];

/**
 * Swagger 설정
 */
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express JWT API",
      version: "1.0.0",
      description: "간단한 로그인/프로필 API 예시",
    },
    servers: [
      { url: "http://localhost:3000", description: "Local server" },
    ],
  },
  apis: ["./server.js"], // 주석으로 API 문서 작성할 파일 경로
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: 사용자 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       200:
 *         description: 로그인 성공, JWT 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: 인증 실패
 */
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: 보호된 사용자 프로필
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로필 정보 반환
 *       401:
 *         description: 토큰 없음
 *       403:
 *         description: 토큰 검증 실패
 */
app.get("/api/profile", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    res.json({ message: "Welcome!", user });
  });
});

// Swagger 보안 스키마 추가
swaggerSpec.components = {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
};

app.listen(3000, () =>
  console.log("✅ Express API running on http://localhost:3000\n📄 Swagger Docs: http://localhost:3000/api-docs")
);
