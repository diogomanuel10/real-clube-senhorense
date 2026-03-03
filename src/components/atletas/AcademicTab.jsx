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
          <label className="block text-xs font-medium text-slate-700">
            Ano letivo
          </label>
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="mt-1 block w-40 rounded-lg border border-slate-200  px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700">
            Período
          </label>
          <select
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="mt-1 block w-40 rounded-lg border border-slate-200  px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
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
        <p className="text-sm text-slate-500">
          A carregar dados académicos...
        </p>
      )}

      {/* resumo */}
      {!loading && record && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="col-span-2 rounded-2xl border border-slate-200  p-4 shadow-sm">
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

          <div className="rounded-2xl border border-slate-200  p-4 shadow-sm">
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
   
      {!loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Notas por disciplina
          </h3>

          {!record || !Array.isArray(record.grades) || record.grades.length === 0 ? (
            <p className="text-sm text-slate-500">
              Sem disciplinas registadas para este período.
            </p>
          ) : (
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
                      <td className="px-3 py-1.5 text-slate-700">{g.subject || "-"}</td>
                      <td className="px-3 py-1.5 text-slate-700">
                        {typeof g.grade === "number" ? g.grade : "-"}
                      </td>
                      <td className="px-3 py-1.5 text-slate-700">{g.teacher || "-"}</td>
                      <td className="px-3 py-1.5 text-slate-700">
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
          <div
            className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER IGUAL AO NOVO EPISÓDIO CLÍNICO */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900">
              <h3 className="text-sm font-semibold text-white">
                {formData.id
                  ? "Editar registo académico"
                  : "Novo registo académico"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-300 hover:text-white hover:bg-slate-700 rounded-full p-1.5 transition"
              >
                Fechar
              </button>
            </div>

            {/* CONTEÚDO */}
            <form
              onSubmit={handleSubmit}
              className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              {/* Linha 1 */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Ano letivo
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) =>
                      handleFieldChange("academicYear", e.target.value)
                    }
                    className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Período
                  </label>
                  <select
                    value={formData.term}
                    onChange={(e) =>
                      handleFieldChange("term", Number(e.target.value))
                    }
                    className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  >
                    {TERMS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
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
                    className="mt-1 block w-full rounded-lg border border-slate-200  px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* Escola */}
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Escola
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) =>
                    handleFieldChange("schoolName", e.target.value)
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-200  px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Assiduidade */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
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
                      <label className="block text-[11px] font-medium text-slate-700">
                        {label}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.attendance[key]}
                        onChange={(e) =>
                          handleAttendanceChange(key, e.target.value)
                        }
                        className="mt-1 block w-full rounded-lg border border-slate-200  px-2.5 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Notas por disciplina
                  </h3>
                  <button
                    type="button"
                    onClick={addGradeRow}
                    className="rounded-lg  px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
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
                      className="space-y-2 rounded-lg bg-white p-2 md:p-3 border border-slate-200"
                    >
                      <div className="grid gap-2 md:grid-cols-4">
                        <input
                          type="text"
                          placeholder="Disciplina"
                          value={g.subject}
                          onChange={(e) => updateGradeRow(index, "subject", e.target.value)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        />
                        <input
                          type="number"
                          placeholder="Nota (0-20)"
                          min={0}
                          max={20}
                          value={g.grade}
                          onChange={(e) => updateGradeRow(index, "grade", e.target.value)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        />
                        <input
                          type="text"
                          placeholder="Professor"
                          value={g.teacher}
                          onChange={(e) => updateGradeRow(index, "teacher", e.target.value)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        />
                        <input
                          type="text"
                          placeholder="Observações"
                          value={g.observations}
                          onChange={(e) =>
                            updateGradeRow(index, "observations", e.target.value)
                          }
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeGradeRow(index)}
                          className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                        >
                          Remover disciplina
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Observações gerais
                </label>
                <textarea
                  rows={3}
                  value={formData.generalObservations}
                  onChange={(e) =>
                    handleFieldChange("generalObservations", e.target.value)
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-200  px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* FOOTER */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg  border border-slate-300 text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
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
