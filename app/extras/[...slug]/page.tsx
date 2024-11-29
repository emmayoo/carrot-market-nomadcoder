export default function CatchAll({
  params,
}: {
  params: Promise<{ params: string[] }>;
}) {
  return <div>CatchAll: {JSON.stringify(params)}</div>;
}
