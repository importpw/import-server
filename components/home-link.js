import { withRouter } from 'next/router';

function HomeLink ({ href = '/', router, children }) {
  function handleClick (e) {
    e.preventDefault()
    router.push('/index', href);
  }
  return <a href={href} onClick={handleClick}>{children}</a>;
}

export default withRouter(HomeLink);
