export interface informationFeed {
  source: string;
  type: 'structured' | 'fragmented' | 'recursive';
  caloricValue: number;
  digestibility: number;
}

export interface nutritionalValue {
  density: number;
  longevity: number;
  satiety: boolean;
}

export async function consumeInformation(feed: informationFeed): Promise<nutritionalValue> {
  const density = feed.caloricValue / (feed.type === 'fragmented' ? 2 : 1);
  const longevity = feed.digestibility * 100;
  
  return {
    density,
    longevity,
    satiety: density > 50 && longevity > 30
  };
}

export function metabolize(input: string): informationFeed {
  return {
    source: 'direct-intake',
    type: input.includes('}') ? 'structured' : 
          input.includes(' ') ? 'fragmented' : 'recursive',
    caloricValue: input.length * 0.1,
    digestibility: input.length > 50 ? 0.7 : 0.3
  };
}
