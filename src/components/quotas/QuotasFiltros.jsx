import React from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';

export default function QuotasFiltros({ 
  searchTerm, 
  setSearchTerm, 
  filtroEquipa, 
  setFiltroEquipa, 
  filtroEstado, 
  setFiltroEstado,
  equipas 
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">
            <FaSearch className="inline mr-2" />
            Procurar Atleta
          </label>
          <input
            type="text"
            placeholder="Nome do atleta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">
            <FaFilter className="inline mr-2" />
            Equipa
          </label>
          <select
            value={filtroEquipa}
            onChange={(e) => setFiltroEquipa(e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="todas">Todas as equipas</option>
            {equipas.map(equipa => (
              <option key={equipa} value={equipa}>{equipa}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">
            <FaFilter className="inline mr-2" />
            Estado
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="todos">Todos</option>
            <option value="pago">Pagas</option>
            <option value="pendente">Pendentes</option>
          </select>
        </div>
      </div>
    </div>
  );
}
