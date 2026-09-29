/**
 * Khoảng progress (0..1) hiện chữ của từng chương — khớp với keyframe khí quyển.
 * File này KHÔNG import three để component React dùng được mà không kéo cả engine vào bundle chính.
 */
export const CHAPTERS: [number, number][] = [
  [0.0, 0.14],
  [0.17, 0.3],
  [0.33, 0.49],
  [0.52, 0.66],
  [0.69, 0.84],
  [0.87, 1.01],
]
