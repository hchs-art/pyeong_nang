import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 정적 사이트로 빌드 → `out` 폴더에 HTML/CSS/JS 생성 (Cloudflare Pages 배포용)
  output: "export",
  // 정적 호스팅에서 next/image 최적화 서버가 없으므로 비활성화
  images: { unoptimized: true },
};

export default nextConfig;
