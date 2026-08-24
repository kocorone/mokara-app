export default function NoteField({ value, onChange, label = '補足でメモしておきたいことがあれば(任意)' }) {
  return (
    <div className="note-field">
      <label htmlFor="note-field">{label}</label>
      <textarea
        id="note-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="書かなくても大丈夫です"
      />
    </div>
  )
}
