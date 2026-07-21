import { simetria, estadoSimetria, type EstadoSimetria } from "@/lib/calculations";
import { colors } from "@/lib/tokens";

const ESTADO_LABEL: Record<EstadoSimetria, string> = {
  deficit: "Déficit",
  aceptable: "Aceptable",
  optimo: "Óptimo",
};

const ESTADO_COLOR: Record<EstadoSimetria, string> = {
  deficit: colors.state.bad,
  aceptable: colors.state.warn,
  optimo: colors.state.good,
};

function fmtFecha(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function fmtValor(n: number) {
  return n < 10 ? n.toFixed(2) : n.toFixed(1);
}

/**
 * Tabla de resultados de test. El % y el estado se calculan con
 * `simetria()` / `estadoSimetria()` — no se leen precalculados del mock.
 */
export function TestsTable({
  simetrias,
}: {
  simetrias: { test: string; fecha: string; izq: number; der: number }[];
}) {
  const filas = [...simetrias].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div className="overflow-hidden rounded-xl border border-borderSoft bg-surface2 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-borderSoft bg-bg text-left text-xs uppercase tracking-wide text-textDim">
              <th className="px-4 py-3 font-medium">Test</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Izquierda</th>
              <th className="px-4 py-3 font-medium">Derecha</th>
              <th className="px-4 py-3 font-medium">Simetría</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => {
              const pct = simetria(fila.izq, fila.der);
              const estado = estadoSimetria(pct);
              return (
                <tr key={fila.test} className="border-b border-borderSoft last:border-0">
                  <td className="px-4 py-3 font-medium text-textStrong">{fila.test}</td>
                  <td className="px-4 py-3 text-textDim">{fmtFecha(fila.fecha)}</td>
                  <td className="px-4 py-3 text-text">{fmtValor(fila.izq)}</td>
                  <td className="px-4 py-3 text-text">{fmtValor(fila.der)}</td>
                  <td className="px-4 py-3 font-display font-bold text-textStrong">
                    {pct.toFixed(0)}%
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        color: ESTADO_COLOR[estado],
                        background: `${ESTADO_COLOR[estado]}1A`,
                      }}
                    >
                      {ESTADO_LABEL[estado]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
