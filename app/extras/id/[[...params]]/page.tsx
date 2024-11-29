export default function OptionalCatchAll({
  params,
}: {
  params: Promise<{ params: string[] }>;
}) {
  return <div>OptionalCatchAll: {JSON.stringify(params)}</div>;
}
