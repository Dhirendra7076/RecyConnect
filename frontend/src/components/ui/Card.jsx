export default function Card({
  children,
  className = '',
  padded = true,
  as: Tag = 'div',
  ...props
}) {
  return (
    <Tag className={`card bg-base-100 shadow-md ${className}`} {...props}>
      {padded ? <div className="card-body">{children}</div> : children}
    </Tag>
  )
}