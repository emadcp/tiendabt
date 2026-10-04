interface AlertBoxProps {
  title: string;
  items: string[];
}

export default function AlertBox({ title, items }: AlertBoxProps) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
      <p className="font-bold text-yellow-900 mb-3">{title}</p>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <p key={idx} className="text-sm text-yellow-800">
            • {item}
          </p>
        ))}
      </div>
    </div>
  );
}
