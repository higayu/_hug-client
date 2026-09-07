export const DUMMY_CHILDREN = [
  { children_id: 101, children_name: '山田 太郎', pc_name: 'PC-01', priority: 0, category: 'normal', status: 'entered', enter: '09:12', leave: '', memo: '今日は落ち着いて活動に参加できています。', support: '声かけは短く、次の行動を具体的に伝える。' },
  { children_id: 102, children_name: '佐藤 花子', pc_name: 'PC-02', priority: 0, category: 'normal', status: 'absent', enter: '欠席', leave: '', memo: '本日は家庭都合で欠席予定です。', support: '次回来所時に前回の課題を確認する。' },
  { children_id: 103, children_name: '鈴木 一郎', pc_name: 'PC-03', priority: 0, category: 'normal', status: 'exited', enter: '09:05', leave: '15:22', memo: '課題を最後まで取り組めました。', support: '成功体験を言葉で具体的にフィードバックする。' },
  { children_id: 104, children_name: '高橋 美咲', pc_name: 'PC-04', priority: 1, category: 'sometimes', status: 'waiting', enter: '', leave: '', memo: '状況に応じて対応する児童です。', support: '本人の様子を確認してから活動へ誘導する。' },
  { children_id: 105, children_name: '田中 健', pc_name: 'PC-05', priority: 2, category: 'temporary', status: 'waiting', enter: '', leave: '', memo: '一時対応のダミーデータです。', support: '必要時のみ個別対応する。' },
  { children_id: 106, children_name: '伊藤 葵', pc_name: '', priority: 0, category: 'waiting', status: 'waiting', enter: '', leave: '', memo: 'キャンセル待ちの児童です。', support: '空き状況を確認する。' },
  { children_id: 107, children_name: '渡辺 翔', pc_name: '', priority: 0, category: 'experience', status: 'waiting', enter: '', leave: '', memo: '体験利用の児童です。', support: '施設の流れを丁寧に案内する。' },
]

export const DUMMY_RECORD_TYPES = [
  { id: 1, name: '計算課題' },
  { id: 2, name: '読み書き' },
  { id: 3, name: 'SST' },
]

export const DUMMY_KADAI_RECORDS = [
  { id: 1, children_id: 101, record_type_id: 1, date: '2026-09-01', score: 85, mistakes: 3, memo1: '集中して取り組めた', memo2: '繰り上がり計算を復習' },
  { id: 2, children_id: 101, record_type_id: 1, date: '2026-09-03', score: 90, mistakes: 2, memo1: '前回より正答率向上', memo2: '文章題も追加' },
  { id: 3, children_id: 101, record_type_id: 2, date: '2026-09-05', score: 78, mistakes: 5, memo1: '漢字で少し迷いあり', memo2: '音読はスムーズ' },
  { id: 4, children_id: 103, record_type_id: 1, date: '2026-09-04', score: 95, mistakes: 1, memo1: '非常に良好', memo2: '次回は応用問題へ' },
]

export const DUMMY_AI_TEXT = `本日の支援記録（ダミー）\n・活動開始時は落ち着いて着席できた。\n・課題は声かけ1回で開始し、最後まで継続できた。\n・困った場面では自分から職員へ質問する様子が見られた。\n・次回も成功した行動を具体的に褒めながら支援する。`
