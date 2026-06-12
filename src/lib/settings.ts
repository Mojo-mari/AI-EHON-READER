// よみあげ設定（こえ・じどうめくり）を端末に記憶する

export type ReaderSettings = {
  voice: string;
  autoTurn: boolean;
};

const STORAGE_KEY = "reader-settings";

export const DEFAULT_SETTINGS: ReaderSettings = {
  voice: "coral",
  autoTurn: false,
};

export function getSettings(): ReaderSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data
      ? { ...DEFAULT_SETTINGS, ...(JSON.parse(data) as Partial<ReaderSettings>) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ReaderSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // 保存できなくても動作は継続する
  }
}
