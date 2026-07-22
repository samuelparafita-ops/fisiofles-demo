"use client";

import { useState, type FormEvent } from "react";
import { ChevronLeft, ListPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/shared/toast";
import { hoyIso } from "@/components/atletas/ficha/fecha-utils";
import {
  accionCrear,
  useCatalogoTests,
  useDispatch,
  type RegistroTest,
  type TestDef,
  type TipoTest,
  type ValorCuestionario,
  type ValorUnico,
  type ValorUnilateral,
} from "@/lib/store";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const TIPO_OPCIONES: { value: TipoTest; label: string }[] = [
  { value: "unilateral-lsi", label: "Unilateral (izquierda/derecha + LSI)" },
  { value: "valor-unico", label: "Valor único" },
  { value: "cuestionario-pro", label: "Cuestionario (puntuación)" },
];

function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Paso = "elegir" | "crear-test" | "valores";

function PasoElegirTest({
  catalogo,
  onElegir,
  onCrear,
}: {
  catalogo: TestDef[];
  onElegir: (test: TestDef) => void;
  onCrear: () => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const filtrados = catalogo
    .filter((t) => t.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div className="mt-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar test del catálogo..."
          className="pl-9"
        />
      </div>
      <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
        {filtrados.length === 0 ? (
          <p className="px-1 py-4 text-center text-sm text-textDim">Sin resultados.</p>
        ) : (
          filtrados.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onElegir(t)}
              className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-bg"
            >
              <span className="font-medium text-textStrong">{t.nombre}</span>
              <span className="shrink-0 text-xs text-textDim">
                {t.variables.map((v) => v.nombre).join(" · ")}
              </span>
            </button>
          ))
        )}
      </div>
      <button
        type="button"
        onClick={onCrear}
        className="mt-3 text-xs font-medium text-brand-ink hover:underline"
      >
        ¿No está tu test? Créalo
      </button>
    </div>
  );
}

function PasoCrearTest({
  onVolver,
  onCreado,
}: {
  onVolver: () => void;
  onCreado: (test: TestDef) => void;
}) {
  const dispatch = useDispatch();
  const [tipo, setTipo] = useState<TipoTest>("valor-unico");
  const [nombre, setNombre] = useState("");
  const [variableUnilateral, setVariableUnilateral] = useState({ nombre: "", unidad: "" });
  const [variablesValorUnico, setVariablesValorUnico] = useState([{ nombre: "", unidad: "" }]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nombreTest = nombre.trim();
    if (!nombreTest) return;

    let variables: TestDef["variables"];
    if (tipo === "unilateral-lsi") {
      const base = variableUnilateral.nombre.trim();
      if (!base) return;
      variables = [
        { id: slugify(base), nombre: base, unidad: variableUnilateral.unidad.trim() },
        { id: "lsi", nombre: "LSI", unidad: "%" },
      ];
    } else if (tipo === "cuestionario-pro") {
      variables = [{ id: "puntuacion", nombre: "Puntuación", unidad: "" }];
    } else {
      const validas = variablesValorUnico
        .map((v) => ({ nombre: v.nombre.trim(), unidad: v.unidad.trim() }))
        .filter((v) => v.nombre);
      if (validas.length === 0) return;
      variables = validas.map((v) => ({ id: slugify(v.nombre), nombre: v.nombre, unidad: v.unidad }));
    }

    const nuevoTest: TestDef = { id: `${slugify(nombreTest)}-${Date.now().toString(36)}`, nombre: nombreTest, variables, tipo };
    dispatch(accionCrear("catalogoTests", nuevoTest));
    onCreado(nuevoTest);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <button
        type="button"
        onClick={onVolver}
        className="flex items-center gap-1 text-xs font-medium text-textDim hover:text-brand-ink"
      >
        <ChevronLeft className="size-3.5" />
        Volver al catálogo
      </button>

      <div className="space-y-1.5">
        <Label htmlFor="nuevo-test-nombre">Nombre del test</Label>
        <Input
          id="nuevo-test-nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Y-Balance test"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nuevo-test-tipo">Tipo</Label>
        <select
          id="nuevo-test-tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoTest)}
          className={selectClass}
        >
          {TIPO_OPCIONES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {tipo === "unilateral-lsi" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Variable medida</Label>
            <Input
              value={variableUnilateral.nombre}
              onChange={(e) => setVariableUnilateral((v) => ({ ...v, nombre: e.target.value }))}
              placeholder="Ej. Distancia"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Unidad</Label>
            <Input
              value={variableUnilateral.unidad}
              onChange={(e) => setVariableUnilateral((v) => ({ ...v, unidad: e.target.value }))}
              placeholder="Ej. cm"
            />
          </div>
          <p className="col-span-2 text-xs text-textDim">
            Se registrará izquierda y derecha, y el LSI (%) se calcula automáticamente.
          </p>
        </div>
      )}

      {tipo === "valor-unico" && (
        <div className="space-y-2">
          <Label>Variables</Label>
          {variablesValorUnico.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={v.nombre}
                onChange={(e) =>
                  setVariablesValorUnico((vs) =>
                    vs.map((x, idx) => (idx === i ? { ...x, nombre: e.target.value } : x))
                  )
                }
                placeholder="Nombre (ej. Altura)"
              />
              <Input
                value={v.unidad}
                onChange={(e) =>
                  setVariablesValorUnico((vs) =>
                    vs.map((x, idx) => (idx === i ? { ...x, unidad: e.target.value } : x))
                  )
                }
                placeholder="Unidad"
                className="max-w-[100px]"
              />
              {variablesValorUnico.length > 1 && (
                <button
                  type="button"
                  onClick={() => setVariablesValorUnico((vs) => vs.filter((_, idx) => idx !== i))}
                  className="shrink-0 text-xs text-textDim hover:text-state-bad"
                >
                  Quitar
                </button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVariablesValorUnico((vs) => [...vs, { nombre: "", unidad: "" }])}
          >
            Añadir variable
          </Button>
        </div>
      )}

      {tipo === "cuestionario-pro" && (
        <p className="text-xs text-textDim">Este tipo registra una única puntuación numérica.</p>
      )}

      <DialogFooter className="mt-2">
        <Button type="submit">Crear test</Button>
      </DialogFooter>
    </form>
  );
}

function PasoValores({
  test,
  atletaId,
  onVolver,
  onRegistrado,
}: {
  test: TestDef;
  atletaId: string;
  onVolver: () => void;
  onRegistrado: () => void;
}) {
  const dispatch = useDispatch();
  const toast = useToast();
  const [fecha, setFecha] = useState(hoyIso());
  const [unilateral, setUnilateral] = useState<Record<string, { izq: string; der: string }>>({});
  const [unico, setUnico] = useState<Record<string, string>>({});
  const [puntuacion, setPuntuacion] = useState("");

  const variablesBase = test.variables.filter((v) => !(v.nombre === "LSI" && v.unidad === "%"));

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    let valores: RegistroTest["valores"];
    if (test.tipo === "unilateral-lsi") {
      const construido: ValorUnilateral = {};
      for (const v of variablesBase) {
        const par = unilateral[v.id];
        construido[v.id] = { izq: Number(par?.izq) || 0, der: Number(par?.der) || 0 };
      }
      valores = construido;
    } else if (test.tipo === "cuestionario-pro") {
      const v: ValorCuestionario = { puntuacion: Number(puntuacion) || 0 };
      valores = v;
    } else {
      const construido: ValorUnico = {};
      for (const v of variablesBase) {
        construido[v.id] = Number(unico[v.id]) || 0;
      }
      valores = construido;
    }

    const nuevoRegistro: RegistroTest = {
      id: `reg-${Date.now().toString(36)}`,
      atletaId,
      testId: test.id,
      fecha,
      valores,
    };
    dispatch(accionCrear("registrosTests", nuevoRegistro));
    toast("Test registrado", `${test.nombre} se ha añadido y los gráficos se han actualizado.`);
    onRegistrado();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <button
        type="button"
        onClick={onVolver}
        className="flex items-center gap-1 text-xs font-medium text-textDim hover:text-brand-ink"
      >
        <ChevronLeft className="size-3.5" />
        Elegir otro test
      </button>

      <p className="font-display text-sm font-bold text-textStrong">{test.nombre}</p>

      <div className="space-y-1.5">
        <Label htmlFor="registro-fecha">Fecha</Label>
        <Input id="registro-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
      </div>

      {test.tipo === "unilateral-lsi" &&
        variablesBase.map((v) => (
          <div key={v.id} className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>
                {v.nombre} — Izquierda {v.unidad && `(${v.unidad})`}
              </Label>
              <Input
                type="number"
                step="any"
                value={unilateral[v.id]?.izq ?? ""}
                onChange={(e) =>
                  setUnilateral((u) => ({ ...u, [v.id]: { izq: e.target.value, der: u[v.id]?.der ?? "" } }))
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                {v.nombre} — Derecha {v.unidad && `(${v.unidad})`}
              </Label>
              <Input
                type="number"
                step="any"
                value={unilateral[v.id]?.der ?? ""}
                onChange={(e) =>
                  setUnilateral((u) => ({ ...u, [v.id]: { izq: u[v.id]?.izq ?? "", der: e.target.value } }))
                }
                required
              />
            </div>
          </div>
        ))}

      {test.tipo === "valor-unico" &&
        variablesBase.map((v) => (
          <div key={v.id} className="space-y-1.5">
            <Label>
              {v.nombre} {v.unidad && `(${v.unidad})`}
            </Label>
            <Input
              type="number"
              step="any"
              value={unico[v.id] ?? ""}
              onChange={(e) => setUnico((u) => ({ ...u, [v.id]: e.target.value }))}
              required
            />
          </div>
        ))}

      {test.tipo === "cuestionario-pro" && (
        <div className="space-y-1.5">
          <Label>Puntuación</Label>
          <Input type="number" step="any" value={puntuacion} onChange={(e) => setPuntuacion(e.target.value)} required />
        </div>
      )}

      <DialogFooter className="mt-2">
        <Button type="submit">Registrar test</Button>
      </DialogFooter>
    </form>
  );
}

export function RegistrarTestDialog({ atletaId }: { atletaId: string }) {
  const [open, setOpen] = useState(false);
  const [paso, setPaso] = useState<Paso>("elegir");
  const [testSeleccionado, setTestSeleccionado] = useState<TestDef | null>(null);
  const catalogo = useCatalogoTests();

  function reset() {
    setPaso("elegir");
    setTestSeleccionado(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <ListPlus className="size-3.5" />
          Registrar test
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar test</DialogTitle>
          <DialogDescription>
            {paso === "elegir"
              ? "Elige un test del catálogo para registrar un nuevo resultado."
              : paso === "crear-test"
                ? "Da de alta un test propio — quedará disponible en el catálogo para todos los atletas."
                : "Introduce los valores de la medición."}
          </DialogDescription>
        </DialogHeader>

        {paso === "elegir" && (
          <PasoElegirTest
            catalogo={catalogo}
            onElegir={(t) => {
              setTestSeleccionado(t);
              setPaso("valores");
            }}
            onCrear={() => setPaso("crear-test")}
          />
        )}
        {paso === "crear-test" && (
          <PasoCrearTest
            onVolver={() => setPaso("elegir")}
            onCreado={(t) => {
              setTestSeleccionado(t);
              setPaso("valores");
            }}
          />
        )}
        {paso === "valores" && testSeleccionado && (
          <PasoValores
            test={testSeleccionado}
            atletaId={atletaId}
            onVolver={() => setPaso("elegir")}
            onRegistrado={() => {
              setOpen(false);
              reset();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
