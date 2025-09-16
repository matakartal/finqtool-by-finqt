import React from "react";
import { CheckSquare } from "lucide-react";

interface Rule {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

const Rules: React.FC = () => {
  const [rules] = React.useState<Rule[]>([
    {
      id: 1,
      title: "Check Market Trend",
      description: "Analyze the overall market direction and sentiment",
      completed: false
    },
    {
      id: 2,
      title: "Risk Management",
      description: "Set your stop loss and take profit levels",
      completed: false
    },
    {
      id: 3,
      title: "Position Size",
      description: "Calculate your position size based on risk percentage",
      completed: false
    },
    {
      id: 4,
      title: "Technical Analysis",
      description: "Check key support and resistance levels",
      completed: false
    },
    {
      id: 5,
      title: "News Impact",
      description: "Check for any market-moving news or events",
      completed: false
    }
  ]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[13px] font-medium text-muted-foreground leading-relaxed">
          Before you enter a trade, review your rules. If all are done, it's time to trade.
        </p>
      </div>
      <div className="space-y-2">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-start gap-3 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <CheckSquare size={15} className="mt-0.5 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="text-[13px] font-semibold tracking-tight">{rule.title}</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{rule.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rules; 