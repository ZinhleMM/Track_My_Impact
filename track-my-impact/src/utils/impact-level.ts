export function getUserImpactLevel(totalCo2Saved: number): {
  level: string;
  badge: string;
  description: string;
  nextTarget: number;
} {
  if (totalCo2Saved >= 500) {
    return {
      level: "Planet Protector",
      badge: "🌍",
      description: "Exceptional environmental leadership - inspiring communities",
      nextTarget: 1000
    };
  }
  if (totalCo2Saved >= 200) {
    return {
      level: "Environmental Champion",
      badge: "🏆",
      description: "Outstanding impact - leading the way in sustainable practices",
      nextTarget: 500
    };
  }
  if (totalCo2Saved >= 100) {
    return {
      level: "Sustainability Expert",
      badge: "🌟",
      description: "Significant positive impact - making a real difference",
      nextTarget: 200
    };
  }
  if (totalCo2Saved >= 50) {
    return {
      level: "Green Guardian",
      badge: "🌿",
      description: "Well-established sustainable habits - great progress!",
      nextTarget: 100
    };
  }
  if (totalCo2Saved >= 20) {
    return {
      level: "Eco Conscious",
      badge: "🍃",
      description: "Building solid environmental habits - keep it up!",
      nextTarget: 50
    };
  }
  if (totalCo2Saved >= 5) {
    return {
      level: "Getting Started",
      badge: "🌱",
      description: "Taking first steps towards sustainability",
      nextTarget: 20
    };
  }
  return {
    level: "New Explorer",
    badge: "⭐",
    description: "Beginning your environmental journey - every action counts!",
    nextTarget: 5
  };
}
