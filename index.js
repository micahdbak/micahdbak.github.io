const COMM =
`wget https://micahdb.com/message.txt -O message.txt
$ cat message.txt\ \ \ \ 
\`
$ `;
const COMM_PROMPT = "micah@localhost~$";
const COMM_BLOCK = '\u2588';
const COMM_SPEED = 50;
const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];
const TAG_COLORS = [
	"#ff8080",
	"#e0a080",
	"#a0a080",
	"#a0e080",
	"#80ff80",
	"#80e0a0",
	"#80a0a0",
	"#80a0e0",
	"#8080ff",
	"#a080e0",
	"#a080a0",
	"#808080",
	"#a0a0a0",
	"#e0e0e0",
	"#ffffff"
];
const THEMES = {
	"light": {
		"--fg": "#141414",
		"--sp": "#a080a0",
		"--bb": "#c0c0c0",
		"--bs": "#e0e0e0",
		"--bg": "#f0f0f0",
		"--bp": "#f8f8f8",
		"--bf": "#ffffff"
	},
	"dark": {
		"--fg": "#f0f0f8",
		"--sp": "#a080a8",
		"--bb": "#404048",
		"--bs": "#28282c",
		"--bg": "#14141a",
		"--bp": "#303038",
		"--bf": "#404048"
	}
};

var date = new Date();
var year = date.getYear();
var month = date.getMonth();

function getDuration(date) {
	let dmonths;

	if (date.to[0] == -1) {
		dmonths = year * 12 + month;
	} else
		dmonths = date.to[0] * 12 + date.to[1];

	dmonths -= date.from[0] * 12 + date.from[1];
	dmonths++;

	let years = Math.floor(dmonths / 12);
	let months = dmonths - years * 12;

	let duration = `${months} month${months == 1 ? '' : 's'}.`;

	if (years > 0)
		duration = `${years} year${years == 1 ? '' : 's'}, ${duration}`;

	return duration;
}

let t = "light";

function toggleTheme(b) {
	if (t == "light") {
		b.innerHTML = "🌞";
		t = "dark";
	} else {
		b.innerHTML = "💤";
		t = "light";
	}

	let r = document.querySelector(":root");
	let props = [ "--fg", "--sp", "--bb", "--bs", "--bg", "--bp", "--bf" ];

	for (const p of props)
	r.style.setProperty(p, THEMES[t][p]);
}

let sel = null;

window.onload = async () => {
	let header = document.getElementById("header");
	let display = document.getElementById("display");

	window.onscroll = () => {
		if ((window.scrollY && !header.classList.contains("scroll"))
		 || (!window.scrollY && header.classList.contains("scroll")))
			header.classList.toggle("scroll");
	};
	window.onscroll();

	theme_btn = document.getElementById("theme-btn");
	theme_btn.onclick = () => {
		toggleTheme(theme_btn);
	};

	let message;
	try {
		message = await fetch("message.txt");
		message = await message.text();
	} catch {
		message = "Sorry... There was an error fetching this message.";
	}

	let cons = document.getElementById("console");
	let comm_i, comm_block, comm_f, inter;

	comm_i = 0;
	comm_block = false;
	comm_f = () => {
		if (comm_i >= COMM.length) {
			if (comm_block)
				cons.innerHTML = cons.innerHTML.slice(0, cons.innerHTML.length - 1);
			else
				cons.innerHTML += COMM_BLOCK;

			comm_block = comm_block ? false : true;

			setTimeout(comm_f, COMM_SPEED * 10);
			return;
		}

		if (COMM[comm_i] == '`') {
			cons.innerHTML += message;
			comm_i++;
		} else
		if (COMM[comm_i] == '$') {
			cons.innerHTML += COMM_PROMPT;
		} else
			cons.innerHTML += COMM[comm_i];

		comm_i++;
		setTimeout(comm_f, COMM_SPEED);
	};
	inter = setTimeout(comm_f, COMM_SPEED);

	let buttons = document.getElementById("buttons");

	for (const b of buttons.children) {
		b.onclick = () => {
			if (sel != null) {
				sel.classList.remove("selected");

				if (sel == b) {
					sel = null;
					return;
				}
			}

			if (!b.classList.contains("dropdown"))
				setTimeout(() => {
					b.classList.remove("selected");

					if (sel == b)
						sel = null;
				}, 500); // deselect this button after 0.5s

			sel = b;
			sel.classList.add("selected");
		};
	}

	let projs;
	try {
		projs = await fetch("projects.json");
		projs = await projs.json();
	} catch {
		projs = [];
	}

	let projects = document.getElementById("projects");
	let projects_b = document.getElementById("projects-buttons");

	let col_i = 0;
	let col_m = new Map();
	let proj_i = 0;

	for (const p of projs) {
		let tags = "";

		for (const t of p.tags) {
			if (!col_m.has(t))
				col_m.set(t, TAG_COLORS[col_i++]);

			tags += `<span class="tag" style="background-color: ${col_m.get(t)}">${t}</span>`;
		}

		let points = "";

		for (const pt of p.points)
			points += `<li>${pt}</li>`;

		let duration = getDuration(p.date);

		projects_b.innerHTML += `<a href="#proj${proj_i}">${p.name}</a>`;
		projects.innerHTML += `
			<h2 class="item relative">
				<div id="proj${proj_i}" class="anchor"></div>
				<span class="date monospace">
					${p.date.from[0]}/${MONTHS[p.date.from[1]]} &ndash;
					${p.date.to[0] == -1 ? "Present" :
						p.date.to[0].toString() + "/" + MONTHS[p.date.to[1]]};
					${duration}
				</span><br>
				<b>${p.name}</b> (<a href="${p.link}">View Project</a>)<br>
				${tags}
			</h2>
			<ul>${points}</ul>
			${p.innerHTML.join('\n')}
			<hr />
		`;
		proj_i++;
	}

	let exps;
	try {
		exps = await fetch("experience.json");
		exps = await exps.json();
	} catch {
		exps = [];
	}

	let experience = document.getElementById("experience");
	let experience_b = document.getElementById("experience-buttons");

	// reset col_i
	col_i = 0;
	let exp_i = 0;

	for (const e of exps) {
		let tags = "";

		for (const t of e.tags) {
			if (!col_m.has(t))
				col_m.set(t, TAG_COLORS[col_i++]);

			tags += `<span class="tag" style="background-color: ${col_m.get(t)}">${t}</span>`;
		}

		let points = "";

		for (const p of e.points)
			points += `<li>${p}</li>`;

		let duration = getDuration(e.date);

		experience_b.innerHTML += `<a href="#exp${exp_i}">${e.title}</a>`;
		experience.innerHTML += `
			<h2 class="item relative">
				<div id="exp${exp_i}" class="anchor"></div>
				<span class="date monospace">
					${e.date.from[0]}/${MONTHS[e.date.from[1]]} &ndash;
					${e.date.to[0] == -1 ? "Present" :
						e.date.to[0].toString() + "/" + MONTHS[e.date.to[1]]};
					${duration}
				</span><br>
				<b>${e.title}</b>, ${e.affiliation}<br>
				<i>${e.location}</i><br>
				${tags}
			</h2>
			<ul>${points}</ul>
			${e.innerHTML.join('\n')}
			<hr />
		`;
		exp_i++;
	}
};
