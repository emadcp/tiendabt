import { AlertTriangle } from "lucide-react";

interface AlertBoxProps {
  title: string;
  items: string[];
}

export default function AlertBox({ title, items }: AlertBoxProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <AlertTriangle className="text-amber-600" size={24} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-amber-900 mb-3 text-lg">{title}</h4>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <p key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <span>{item}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
