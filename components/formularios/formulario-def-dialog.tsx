"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Plus, Pencil } from "lucide-react";
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
import { CamposFormularioEditor } from "@/components/formularios/campos-formulario-editor";
import { FormularioCamposPreview } from "@/components/formularios/formulario-campos-preview";
import {
  accionActualizar,
  accionCrear,
  useCatalogoTests,
  useDispatch,
  type CampoFormulario,
  type FormularioDef,
} from "@/lib/store";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Crea o edita un FormularioDef — editor de campos a la izquierda, vista
 * previa en vivo (ancho de móvil) a la derecha, tal como lo vería el atleta.
 * Misma UI para crear/editar, igual que `PlantillaSesionDialog`.
 */
export function FormularioDefDialog({
  formulario,
  trigger,
  open: openProp,
  onOpenChange,
}: {
  formulario?: FormularioDef;
  /** `null` = sin disparador propio (diálogo controlado desde fuera, ej. un menú contextual). */
  trigger?: ReactNode | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;
  const dispatch = useDispatch();
  const toast = useToast();
  const catalogo = useCatalogoTests();
  const editando = Boolean(formulario);

  const [nombre, setNombre] = useState(formulario?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(formulario?.descripcion ?? "");
  const [campos, setCampos] = useState<CampoFormulario[]>(formulario?.campos ?? []);
  const [testDefId, setTestDefId] = useState(formulario?.testDefId ?? "");
  const [respuestasPreview, setRespuestasPreview] = useState<Record<string, string>>({});

  const testsPro = catalogo.filter((t) => t.tipo === "cuestionario-pro");

  useEffect(() => {
    if (open) {
      setNombre(formulario?.nombre ?? "");
      setDescripcion(formulario?.descripcion ?? "");
      setCampos(formulario?.campos ?? []);
      setTestDefId(formulario?.testDefId ?? "");
      setRespuestasPreview({});
    }
  }, [open, formulario]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!nombre.trim() || campos.length === 0) return;

    if (formulario) {
      dispatch(
        accionActualizar("formulariosDef", formulario.id, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          campos,
          testDefId: testDefId || undefined,
        })
      );
      toast("Formulario actualizado", `${nombre} se ha guardado.`);
    } else {
      const nuevo: FormularioDef = {
        id: `form-${slugify(nombre)}-${Date.now().toString(36)}`,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        campos,
        testDefId: testDefId || undefined,
      };
      dispatch(accionCrear("formulariosDef", nuevo));
      toast("Formulario creado", `${nombre} ya está listo para enviar.`);
    }

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button>
              {editando ? <Pencil className="size-4" /> : <Plus className="size-4" />}
              {editando ? "Editar" : "Nuevo formulario"}
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[88vh] max-w-4xl overflow-hidden p-0">
        <form onSubmit={handleSubmit} className="flex max-h-[88vh] flex-col">
          <DialogHeader className="border-b border-borderSoft px-6 py-5">
            <DialogTitle>{editando ? "Editar formulario" : "Nuevo formulario"}</DialogTitle>
            <DialogDescription>
              Cada campo puede conectar con las gráficas del atleta — la vista previa de la derecha
              muestra exactamente lo que verá al rellenarlo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_400px]">
            <div className="space-y-4 overflow-y-auto px-6 py-5">
              <div className="space-y-1.5">
                <Label htmlFor="formulario-nombre">Nombre</Label>
                <Input
                  id="formulario-nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. RPE post-sesión"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="formulario-descripcion">Descripción</Label>
                <textarea
                  id="formulario-descripcion"
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. Percepción de esfuerzo de la sesión de hoy."
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="formulario-test">Vincular a un test PRO del catálogo (opcional)</Label>
                <select
                  id="formulario-test"
                  value={testDefId}
                  onChange={(e) => setTestDefId(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Ninguno — solo se guarda como envío</option>
                  {testsPro.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-textDim">
                  Si lo vinculas, cada respuesta también genera un registro de ese test en el histórico
                  del atleta, además de guardarse como envío.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Campos</Label>
                <CamposFormularioEditor campos={campos} onChange={setCampos} />
              </div>
            </div>

            <div className="overflow-y-auto border-t border-borderSoft bg-bg px-5 py-5 lg:border-l lg:border-t-0">
              <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-xl border border-borderSoft bg-surface2 shadow-sm">
                <div className="border-b border-borderSoft bg-bg px-5 py-4">
                  <p className="text-xs font-medium text-textDim">Vista previa · móvil del atleta</p>
                  <p className="mt-0.5 font-display text-base font-bold text-textStrong">
                    {nombre || "Nombre del formulario"}
                  </p>
                </div>
                <div className="space-y-5 px-5 py-5">
                  <p className="text-sm text-textDim">{descripcion || "Descripción del formulario…"}</p>
                  {campos.length === 0 ? (
                    <p className="text-sm text-textDim">Añade campos para verlos aquí.</p>
                  ) : (
                    <FormularioCamposPreview
                      campos={campos}
                      respuestas={respuestasPreview}
                      onChange={(id, valor) => setRespuestasPreview((r) => ({ ...r, [id]: valor }))}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-borderSoft px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!nombre.trim() || campos.length === 0}>
              {editando ? "Guardar cambios" : "Crear formulario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
