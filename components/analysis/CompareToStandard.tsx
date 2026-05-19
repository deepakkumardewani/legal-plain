interface CompareToStandardProps {
  text: string;
}

export function CompareToStandard({ text }: CompareToStandardProps) {
  return (
    <div className="mt-2 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
      <span className="font-medium">Industry standard: </span>
      {text}
    </div>
  );
}
