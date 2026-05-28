interface CompareToStandardProps {
  text: string;
}

export function CompareToStandard({ text }: CompareToStandardProps) {
  return (
    <div className="mt-2 rounded-lg bg-[#f7efe2] px-3 py-2 text-sm text-[#5c4a32]">
      <span className="font-medium text-[#18181f]">Industry standard: </span>
      {text}
    </div>
  );
}
