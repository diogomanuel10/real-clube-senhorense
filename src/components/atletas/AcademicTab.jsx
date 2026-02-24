// src/components/atletas/AcademicTab.jsx
import { useEffect, useState } from "react";
import {
  getAcademicRecord,
  getAcademicRecordsByAthlete,
  saveAcademicRecord,
} from "../../services/academicService";

const CURRENT_YEAR = "2025/2026"; // podes tornar dinâmico

const TERMS = [
  { value: 1, label: "1.º Período" },
  { value: 2, label: "2.º Período" },
  { value: 3, label: "3.º Período" },
];

export default function AcademicTab({ athleteId }) {
  const [loading, setLoading] = useState(false);
  const [academicYear, setAcademicYear] = useState(CURRENT_YEAR);
  const [term, setTerm] = useState(1);
  const [record, setRecord] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    academicYear: CURRENT_YEAR,
    term: 1,
    schoolName: "",
    schoolYear: "",
    grades: [],
    attendance: {
      totalDays: "",
      presentDays: "",
      absentDays: "",
      unjustifiedAbsences: "",
      lateArrivals: "",
    },
    generalObservations: "",
  });

  useEffect(() => {
    if (!athleteId) return;
    loadRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [athleteId, academicYear, term]);

  async function loadRecord() {
    try {
      setLoading(true);
      const data = await getAcademicRecord(athleteId, academicYear, term);
      setRecord(data);
      if (data) {
        setFormData({
          id: data.id,
          academicYear: data.academicYear,
          term: data.term,
          schoolName: data.schoolName || "",
          schoolYear: data.schoolYear || "",
          grades: data.grades || [],
          attendance: {
            totalDays: data.attendance?.totalDays ?? "",
            presentDays: data.attendance?.presentDays ?? "",
            absentDays: data.attendance?.absentDays ?? "",
            unjustifiedAbsences:
              data.attendance?.unjustifiedAbsences ?? "",
            lateArrivals: data.attendance?.lateArrivals ?? "",
          },
          generalObservations: data.generalObservations || "",
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          id: null,
          academicYear,
          term,
          schoolName: "",
          schoolYear: "",
          grades: [],
          attendance: {
            totalDays: "",
            presentDays: "",
            absentDays: "",
            unjustifiedAbsences: "",
            lateArrivals: "",
          },
          generalObservations: "",
        }));
      }
    } finally {
      setLoading(false);
    }
  }

  function handleFieldChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleAttendanceChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [field]: value,
      },
    }));
  }

  function addGradeRow() {
    setFormData((prev) => ({
      ...prev,
      grades: [
        ...prev.grades,
        { subject: "", grade: "", teacher: "", observations: "" },
      ],
    }));
  }

  function updateGradeRow(index, field, value) {
    setFormData((prev) => {
      const grades = [...prev.grades];
      grades[index] = { ...grades[index], [field]: value };
      return { ...prev, grades };
    });
  }

  function removeGradeRow(index) {
    setFormData((prev) => {
      const grades = prev.grades.filter((_, i) => i !== index);
      return { ...prev, grades };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        schoolYear: Number(formData.schoolYear) || null,
        term: Number(formData.term),
        academicYear,
        grades: formData.grades.map((g) => ({
          ...g,
          grade: g.grade === "" ? null : Number(g.grade),
        })),
        attendance: {
          totalDays:
            formData.attendance.totalDays === ""
              ? null
              : Number(formData.attendance.totalDays),
          presentDays:
            formData.attendance.presentDays === ""
              ? null
              : Number(formData.attendance.presentDays),
          absentDays:
            formData.attendance.absentDays === ""
              ? null
              : Number(formData.attendance.absentDays),
          unjustifiedAbsences:
            formData.attendance.unjustifiedAbsences === ""
              ? null
              : Number(formData.attendance.unjustifiedAbsences),
          lateArrivals:
            formData.attendance.lateArrivals === ""
              ? null
              : Number(formData.attendance.lateArrivals),
        },
      };

      const id = await saveAcademicRecord(athleteId, payload);
      setFormData((prev) => ({ ...prev, id }));
      await loadRecord();
      setShowForm(false);
    } catch (err) {
      console.error("Erro ao guardar registo académico", err);
      alert("Erro ao guardar registo académico.");
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status) {
    if (status === "verde") return "bg-emerald-100 text-emerald-800";
    if (status === "vermelho") return "bg-red-100 text-red-800";
    return "bg-amber-100 text-amber-800";
  }

  return (
    <div className="space-y-4">
      {/* filtros ano/período */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600">
            Ano letivo
          </label>
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="mt-1 block w-40 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">
            Período
          </label>
          <select
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="mt-1 block w-40 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          >
            {TERMS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          {record ? "Editar registo" : "Novo registo académico"}
        </button>
      </div>

      {loading && (
        <p className="text-sm text-slate-500">A carregar dados académicos...</p>
      )}

      {/* resumo */}
      {!loading && record && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">
              Informações escolares
            </h3>
            <p className="text-sm text-slate-700">
              <span className="font-medium">Escola:</span>{" "}
              {record.schoolName || "-"}
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-medium">Ano escolar:</span>{" "}
              {record.schoolYear || "-"}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              <span className="font-medium">Observações gerais:</span>{" "}
              {record.generalObservations || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">
              Estado académico
            </h3>
            <p className="text-sm text-slate-700">
              <span className="font-medium">Média do período:</span>{" "}
              {record.finalAverage ?? "-"}
            </p>
            <div className="mt-3">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                  record.academicStatus
                )}`}
              >
                {record.academicStatus === "verde" && "Situação estável"}
                {record.academicStatus === "amarelo" &&
                  "Acompanhamento recomendado"}
                {record.academicStatus === "vermelho" && "Risco académico"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* tabela de notas */}
      {!loading && record && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Notas por disciplina
          </h3>
          {(!record.grades || record.grades.length === 0) && (
            <p className="text-sm text-slate-500">
              Sem disciplinas registadas para este período.
            </p>
          )}
          {record.grades && record.grades.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 font-medium text-slate-700">
                      Disciplina
                    </th>
                    <th className="px-3 py-2 font-medium text-slate-700">
                      Nota
                    </th>
                    <th className="px-3 py-2 font-medium text-slate-700">
                      Professor
                    </th>
                    <th className="px-3 py-2 font-medium text-slate-700">
                      Observações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {record.grades.map((g, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-1.5">{g.subject}</td>
                      <td className="px-3 py-1.5">{g.grade ?? "-"}</td>
                      <td className="px-3 py-1.5">{g.teacher || "-"}</td>
                      <td className="px-3 py-1.5">
                        {g.observations || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* modal de formulário */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-3">
              <h2 className="text-sm font-semibold text-white">
                {formData.id
                  ? "Editar registo académico"
                  : "Novo registo académico"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Fechar
              </button>
            </div>

            {/* conteúdo scrollável */}
            <form
              onSubmit={handleSubmit}
              className="max-h-[70vh] overflow-y-auto px-5 py-4 space-y-4"
            >
              {/* linha 1 */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Ano letivo
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) =>
                      handleFieldChange("academicYear", e.target.value)
                    }
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Período
                  </label>
                  <select
                    value={formData.term}
                    onChange={(e) =>
                      handleFieldChange("term", Number(e.target.value))
                    }
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  >
                    {TERMS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Ano escolar
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={formData.schoolYear}
                    onChange={(e) =>
                      handleFieldChange("schoolYear", e.target.value)
                    }
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* escola */}
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Escola
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) =>
                    handleFieldChange("schoolName", e.target.value)
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* assiduidade */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Assiduidade escolar
                </h3>
                <div className="grid gap-3 md:grid-cols-5">
                  {[
                    ["totalDays", "Dias letivos"],
                    ["presentDays", "Dias presentes"],
                    ["absentDays", "Faltas"],
                    ["unjustifiedAbsences", "Faltas injustificadas"],
                    ["lateArrivals", "Atrasos"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-[11px] font-medium text-slate-600">
                        {label}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.attendance[key]}
                        onChange={(e) =>
                          handleAttendanceChange(key, e.target.value)
                        }
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* notas */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Notas por disciplina
                  </h3>
                  <button
                    type="button"
                    onClick={addGradeRow}
                    className="rounded-lg bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    + Adicionar disciplina
                  </button>
                </div>
                {formData.grades.length === 0 && (
                  <p className="text-xs text-slate-500">
                    Ainda não adicionaste disciplinas.
                  </p>
                )}
                <div className="space-y-2">
                  {formData.grades.map((g, index) => (
                    <div
                      key={index}
                      className="grid gap-2 rounded-lg bg-white p-2 md:grid-cols-4"
                    >
                      <input
                        type="text"
                        placeholder="Disciplina"
                        value={g.subject}
                        onChange={(e) =>
                          updateGradeRow(index, "subject", e.target.value)
                        }
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                      />
                      <input
                        type="number"
                        placeholder="Nota (0-20)"
                        min={0}
                        max={20}
                        value={g.grade}
                        onChange={(e) =>
                          updateGradeRow(index, "grade", e.target.value)
                        }
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                      />
                      <input
                        type="text"
                        placeholder="Professor"
                        value={g.teacher}
                        onChange={(e) =>
                          updateGradeRow(index, "teacher", e.target.value)
                        }
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Observações"
                          value={g.observations}
                          onChange={(e) =>
                            updateGradeRow(
                              index,
                              "observations",
                              e.target.value
                            )
                          }
                          className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        />
                        <button
                          type="button"
                          onClick={() => removeGradeRow(index)}
                          className="rounded-lg bg-red-50 px-2 text-xs font-medium text-red-600 hover:bg-red-100"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* observações */}
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Observações gerais
                </label>
                <textarea
                  rows={3}
                  value={formData.generalObservations}
                  onChange={(e) =>
                    handleFieldChange("generalObservations", e.target.value)
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* footer do form */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? "A guardar..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
