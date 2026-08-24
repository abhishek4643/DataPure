export function Skeleton({ w = '100%', h = 16, r = 6, mb = 0 }) {
  return (
    <div
      className="skeleton"
      style={{ width: w, height: h, borderRadius: r, marginBottom: mb }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass p-5" style={{ borderRadius: 14 }}>
      <Skeleton w={40} h={40} r={10} mb={16} />
      <Skeleton w="55%" h={28} mb={8} />
      <Skeleton w="40%" h={14} />
    </div>
  );
}

export function SkeletonRow({ cols = 5 }) {
  const widths = ['40px', '25%', '30%', '18%', '20%'];
  return (
    <tr>
      {Array(cols).fill(0).map((_, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <Skeleton w={widths[i] || '70%'} h={14} />
        </td>
      ))}
    </tr>
  );
}
