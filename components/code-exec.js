import { encode } from 'querystring';
import fetch from 'isomorphic-fetch';
import Xterm from './xterm';

export default class extends React.Component {
	constructor(...args) {
		super(...args);
	}

	async componentDidMount() {
		const { code } = this.props;
		const { term } = this.refs.xterm;
		term.write('$ Running...\r\n');

		const bootstrap =
			'dir="$(mktemp -d)"; trap "rm -rf $dir" EXIT TERM INT; cat > "$dir/script" && chmod +x "$dir/script" && IMPORT_CACHE="$dir" "$dir/script" 2>&1';
		const res = await fetch(
			`https://exec.import.pw/sh?arg=-c&arg=${encodeURIComponent(
				bootstrap
			)}`,
			{
				method: 'POST',
				body: code
			}
		);
		const body = await res.text();
		term.write(body.replace(/\n/g, '\r\n'));
	}

	render() {
		return (
			<div className="wrapper">
				<Xterm ref="xterm" lineHeight={1.2} />
				<style jsx>{`
					.wrapper {
						background-color: black;
						padding: 10px;
					}
				`}</style>
			</div>
		);
	}
}
