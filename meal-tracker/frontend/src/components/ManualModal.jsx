import "./ManualModal.css";

export default function ManualModal({
  open,
  manual,
  setManual,
  onClose,
  onSubmit
}) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">추정으로 기록</div>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="field">
            <div className="label">음식</div>
            <input value={manual.rawName} readOnly className="input" />
          </div>

          <div className="row">
            <div className="field">
              <div className="label">수량</div>
              <input
                type="number"
                min={1}
                value={manual.count}
                onChange={(e) => {
                  const v = Math.max(1, Number(e.target.value || 1));
                  setManual(prev => ({ ...prev, count: v }));
                }}
                className="input"
              />
            </div>

            <div className="field">
              <div className="label">단백질 (g)</div>
              <input
                type="number"
                min={0}
                step="1"
                value={manual.protein}
                onChange={(e) =>
                  setManual(prev => ({ ...prev, protein: e.target.value }))
                }
                className="input"
              />
            </div>

            <div className="field">
              <div className="label">칼로리 (kcal)</div>
              <input
                type="number"
                min={0}
                step="1"
                value={manual.kcal}
                onChange={(e) =>
                  setManual(prev => ({ ...prev, kcal: e.target.value }))
                }
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn ghost" onClick={onClose}>취소</button>
          <button className="btn primary" onClick={onSubmit}>기록</button>
        </div>
      </div>
    </div>
  );
}
