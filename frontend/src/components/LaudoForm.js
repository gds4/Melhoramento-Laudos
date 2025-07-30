import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const formatLabel = (key) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const LaudoForm = ({ laudoData }) => {
  const [formData, setFormData] = useState(laudoData);
  const [isSaving, setIsSaving] = useState(false);
  const [improvingField, setImprovingField] = useState(null);

  const reportTemplateRef = useRef(null);

  useEffect(() => {
    setFormData(laudoData);
  }, [laudoData]);

  const handleInputChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setFormData(prev => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImproveClick = async (fieldName, section = null) => {
    let textToImprove = section ? formData[section][fieldName] : formData[fieldName];
    if (!textToImprove) return;

    setImprovingField(fieldName);
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/improve-text', { text: textToImprove });
      const { improved_text } = response.data;
      handleInputChange({ target: { name: fieldName, value: improved_text } }, section);
    } catch (err) {
      console.error("Erro ao melhorar o texto:", err);
      alert("Não foi possível melhorar o texto.");
    } finally {
      setImprovingField(null);
    }
  };

  const handleGeneratePdf = async () => {
    setIsSaving(true);
    const reportElement = reportTemplateRef.current;
    if (!reportElement) { setIsSaving(false); return; }
    const canvas = await html2canvas(reportElement, { scale: 3 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210, margin = 15;
    const imgWidth = pdfWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    const fileName = `laudo_${formData.paciente.nome.replace(/ /g, '_') || 'paciente'}.pdf`;
    pdf.save(fileName);
    setIsSaving(false);
  };
  
  const isBusy = improvingField !== null;

  if (!formData) return null;

  return (
    <>
      {/* --- TEMPLATE OCULTO E COMPLETO PARA O PDF --- */}
      <div className="pdf-preload-container">
        <div className="report-container-for-pdf" ref={reportTemplateRef}>
            <div className="report-header">
                <h1>Laudo de Ultrassonografia</h1>
                <p>Data de Geração: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="report-section">
                <h2>Dados do Paciente</h2>
                <p><strong>Nome:</strong> {formData.paciente.nome}</p>
            </div>
            <div className="report-section">
                <h2>Achados do Exame</h2>
                <table className="report-table">
                    <tbody>
                        {Object.entries(formData.orgaos).map(([key, value]) => ( value ? (<tr key={key}><td className="orgao-titulo">{formatLabel(key)}:</td><td className="orgao-descricao">{value}</td></tr>) : null ))}
                    </tbody>
                </table>
            </div>
            {formData.conclusao && (<div className="report-section"><h2>Conclusão / Impressão Diagnóstica</h2><p>{formData.conclusao}</p></div>)}
            <div className="report-footer"><div className="assinatura-linha"><p>Dr(a). Médico(a) Responsável</p></div></div>
        </div>
      </div>
      
      {/* --- FORMULÁRIO EDITÁVEL VISÍVEL (SEM BOTÕES DE DITADO) --- */}
      <div className="results-container">
        <h2>Laudo Estruturado</h2>
        <form onSubmit={(e) => e.preventDefault()} className="laudo-form">
          <div className="form-section">
            <h3>Dados do Paciente</h3>
            <div className="form-group-with-actions">
              <div className="form-group"><label htmlFor="nome">Nome</label><input type="text" id="nome" name="nome" value={formData.paciente.nome} onChange={(e) => handleInputChange(e, 'paciente')} disabled={isBusy} /></div>
              <div className="actions-container">
                  <button type="button" className="action-button improve-button" onClick={() => handleImproveClick('nome', 'paciente')} disabled={isBusy} title="Melhorar Texto com IA">{improvingField === 'nome' ? '...' : '✨'}</button>
              </div>
            </div>
          </div>
          <div className="form-section">
            <h3>Achados do Exame</h3>
            {Object.keys(formData.orgaos).map((orgaoKey) => (
              <div className="form-group-with-actions" key={orgaoKey}>
                <div className="form-group"><label htmlFor={orgaoKey}>{formatLabel(orgaoKey)}</label><textarea id={orgaoKey} name={orgaoKey} value={formData.orgaos[orgaoKey]} onChange={(e) => handleInputChange(e, 'orgaos')} rows={3} disabled={isBusy} /></div>
                <div className="actions-container">
                    <button type="button" className="action-button improve-button" onClick={() => handleImproveClick(orgaoKey, 'orgaos')} disabled={isBusy} title="Melhorar Texto com IA">{improvingField === orgaoKey ? '...' : '✨'}</button>
                </div>
              </div>
            ))}
          </div>
          <div className="form-section">
            <h3>Conclusão / Impressão Diagnóstica</h3>
            <div className="form-group-with-actions">
              <div className="form-group"><label htmlFor="conclusao">Conclusão</label><textarea id="conclusao" name="conclusao" value={formData.conclusao} onChange={(e) => handleInputChange(e)} rows={4} disabled={isBusy} /></div>
              <div className="actions-container">
                  <button type="button" className="action-button improve-button" onClick={() => handleImproveClick('conclusao')} disabled={isBusy} title="Melhorar Texto com IA">{improvingField === 'conclusao' ? '...' : '✨'}</button>
              </div>
            </div>
          </div>
          <button type="button" className="save-button" onClick={handleGeneratePdf} disabled={isSaving || isBusy}>
            {isSaving ? 'Gerando PDF...' : 'Salvar e Gerar PDF'}
          </button>
        </form>
      </div>
    </>
  );
};

export default LaudoForm;