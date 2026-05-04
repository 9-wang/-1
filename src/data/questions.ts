export interface Question {
  id: number
  question: string
  type: 'single' | 'multiple' | 'scale'
  options?: { label: string; value: string | number }[]
  scaleMin?: number
  scaleMax?: number
  scaleLabel?: string
}

export const screenQuestions: Question[] = [
  {
    id: 1,
    question: '最近一周，您的睡眠情况如何？',
    type: 'single',
    options: [
      { label: '睡眠充足，每晚7-8小时', value: 'good' },
      { label: '偶尔熬夜，睡眠质量一般', value: 'average' },
      { label: '经常熬夜，入睡困难', value: 'poor' },
      { label: '严重失眠，整夜难眠', value: 'severe' }
    ]
  },
  {
    id: 2,
    question: '您每天的运动量大约是多少？',
    type: 'single',
    options: [
      { label: '1小时以上', value: 'high' },
      { label: '30分钟-1小时', value: 'medium' },
      { label: '10-30分钟', value: 'low' },
      { label: '几乎不运动', value: 'none' }
    ]
  },
  {
    id: 3,
    question: '您的饮食习惯如何？',
    type: 'single',
    options: [
      { label: '规律饮食，营养均衡', value: 'balanced' },
      { label: '偶尔吃快餐，基本规律', value: 'average' },
      { label: '经常吃外卖和油炸食品', value: 'unhealthy' },
      { label: '饮食极不规律，暴饮暴食', value: 'severe' }
    ]
  },
  {
    id: 4,
    question: '最近一个月，您是否感到压力过大？',
    type: 'single',
    options: [
      { label: '几乎没有压力', value: 'none' },
      { label: '有一些压力，但可以应对', value: 'low' },
      { label: '压力较大，有时感到焦虑', value: 'medium' },
      { label: '压力非常大，影响日常生活', value: 'high' }
    ]
  },
  {
    id: 5,
    question: '您是否有以下身体不适症状？（可多选）',
    type: 'multiple',
    options: [
      { label: '疲劳乏力', value: 'fatigue' },
      { label: '头晕头痛', value: 'dizziness' },
      { label: '腰酸背痛', value: 'back_pain' },
      { label: '视力模糊', value: 'vision' },
      { label: '记忆力下降', value: 'memory' },
      { label: '情绪低落', value: 'mood' },
      { label: '食欲不振', value: 'appetite' },
      { label: '无不适症状', value: 'none' }
    ]
  },
  {
    id: 6,
    question: '您对自己当前健康状况的满意度是多少？',
    type: 'scale',
    scaleMin: 1,
    scaleMax: 10,
    scaleLabel: '分'
  },
  {
    id: 7,
    question: '您每周使用电子设备的时间大约是多少？',
    type: 'single',
    options: [
      { label: '4小时以下', value: 'low' },
      { label: '4-8小时', value: 'medium' },
      { label: '8-12小时', value: 'high' },
      { label: '12小时以上', value: 'extreme' }
    ]
  },
  {
    id: 8,
    question: '您是否有吸烟或饮酒的习惯？',
    type: 'single',
    options: [
      { label: '从不吸烟饮酒', value: 'none' },
      { label: '偶尔饮酒，不吸烟', value: 'occasional' },
      { label: '经常饮酒或吸烟', value: 'regular' },
      { label: '大量吸烟饮酒', value: 'heavy' }
    ]
  }
]

export const healthCategories = {
  '健康': { color: '#34a853', description: '身体状态良好，继续保持' },
  '轻度亚健康': { color: '#fbbc05', description: '轻微不适，需要关注' },
  '中度亚健康': { color: '#fb8c00', description: '明显不适，需要调整' },
  '重度亚健康': { color: '#ea4335', description: '严重不适，建议就医' }
}
