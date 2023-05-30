// @ts-nocheck

// https://www.npmjs.com/package/ignore-walk
import * as fs from 'fs';
import path from 'path';
import { EventEmitter as EE } from 'events';
import { Minimatch, minimatch } from 'minimatch';
import { IOptions } from './types';

class Walker extends EE {
  isSymbolicLink: any;
  path: any;
  basename: string;
  ignoreFiles: any;
  ignoreRules: {};
  parent: any;
  includeEmpty: boolean;
  root: any;
  follow: boolean;
  result: any;
  entries: any;
  sawError: boolean;

  constructor (opts) {
    opts = opts || {};
    super(opts);
    // set to true if this.path is a symlink, whether follow is true or not
    this.isSymbolicLink = opts.isSymbolicLink;
    this.path = opts.path || process.cwd();
    this.basename = path.basename(this.path);
    this.ignoreFiles = opts.ignoreFiles || ['.signore'];
    this.ignoreRules = {};
    this.parent = opts.parent || null;
    this.includeEmpty = !!opts.includeEmpty;
    this.root = this.parent ? this.parent.root : this.path;
    this.follow = !!opts.follow;
    this.result = this.parent ? this.parent.result : new Set();
    this.entries = null;
    this.sawError = false;
  }

  sort (a, b) {
    return a.localeCompare(b, 'en');
  }

  emit (ev, data) {
    let ret = false;
    if (!(this.sawError && ev === 'error')) {
      if (ev === 'error') {
        this.sawError = true;
      } else if (ev === 'done' && !this.parent) {
        data = Array.from(data)
          .map((e: string) => /^@/.test(e) ? `./${e}` : e).sort(this.sort);
        this.result = data;
      }

      if (ev === 'error' && this.parent) {
        ret = this.parent.emit('error', data);
      } else {
        ret = super.emit(ev, data);
      }
    }
    return ret;
  }

  start () {
    fs.readdir(this.path, (er, entries) =>
      er ? this.emit('error', er) : this.onReaddir(entries));
    return this;
  }

  isIgnoreFile (e) {
    return e !== '.' &&
      e !== '..' &&
      this.ignoreFiles.indexOf(e) !== -1;
  }

  onReaddir (entries) {
    this.entries = entries;
    if (entries.length === 0) {
      if (this.includeEmpty) {
        this.result.add(this.path.substr(this.root.length + 1));
      }
      this.emit('done', this.result);
    } else {
      const hasIg = this.entries.some(e => this.isIgnoreFile(e));

      if (hasIg) {
        this.addIgnoreFiles();
      } else {
        this.filterEntries();
      }
    }
  }

  addIgnoreFiles () {
    const newIg = this.entries
      .filter(e => this.isIgnoreFile(e));

    let igCount = newIg.length;
    const then = _ => {
      if (--igCount === 0) {
        this.filterEntries();
      }
    }

    newIg.forEach(e => this.addIgnoreFile(e, then));
  }

  addIgnoreFile (file, then) {
    const ig = path.resolve(this.path, file);
    fs.readFile(ig, 'utf8', (er, data) =>
      er ? this.emit('error', er) : this.onReadIgnoreFile(file, data, then));
  }

  onReadIgnoreFile (file, data, then) {
    const mmopt = {
      matchBase: true,
      dot: true,
      flipNegate: true,
      nocase: true,
    };
    const rules = data.split(/\r?\n/)
      .filter(line => !/^#|^$/.test(line.trim()))
      .map(r => {
        // support ./ && !./
        if (r) {
          if (r.startsWith('./')) {
            r = r.substring(1);
          } else if (r.startsWith('!./')) {
            r = r.replace(/^(\!\.\/)/, '!/');
          }
        }

        return new Minimatch(r, mmopt);
      });

    this.ignoreRules[file] = rules;

    then();
  }

  filterEntries () {
    // at this point we either have ignore rules, or just inheriting
    // this exclusion is at the point where we know the list of
    // entries in the dir, but don't know what they are.  since
    // some of them *might* be directories, we have to run the
    // match in dir-mode as well, so that we'll pick up partials
    // of files that will be included later.  Anything included
    // at this point will be checked again later once we know
    // what it is.
    const filtered = this.entries.map(entry => {
      // at this point, we don't know if it's a dir or not.
      const passFile = this.filterEntry(entry, false);
      const passDir = this.filterEntry(entry, true);

      return (passFile || passDir) ? [entry, passFile, passDir] : false;
    }).filter(e => e);

    // now we stat them all
    // if it's a dir, and passes as a dir, then recurse
    // if it's not a dir, but passes as a file, add to set
    let entryCount = filtered.length;
    if (entryCount === 0) {
      this.emit('done', this.result);
    } else {
      const then = _ => {
        if (--entryCount === 0) {
          this.emit('done', this.result);
        }
      }

      filtered.forEach(filt => {
        const entry = filt[0];
        const file = filt[1];
        const dir = filt[2];
        this.stat({ entry, file, dir }, then);
      })
    }
  }

  onstat ({ st, entry, file, dir, isSymbolicLink }, then) {
    const abs = this.path + '/' + entry;
    if (!st.isDirectory()) {
      if (file) {
        this.result.add(abs.substring(this.root.length + 1));
      }
      then()
    } else {
      // is a directory
      if (dir) {
        this.walker(entry, { isSymbolicLink }, then);
      } else {
        // TODO: 
        // if (file) {
        //   this.result.add(abs.substring(this.root.length + 1));
        // }
        then();
      }
    }
  }

  stat ({ entry, file, dir }, then) {
    const abs = this.path + '/' + entry;
    fs.lstat(abs, (er, st) => {
      if (er) {
        this.emit('error', er);
      } else {
        const isSymbolicLink = st.isSymbolicLink();
        if (this.follow && isSymbolicLink) {
          fs.stat(abs, (er, st) => {
            if (er) {
              this.emit('error', er);
            } else {
              this.onstat({ st, entry, file, dir, isSymbolicLink }, then);
            }
          })
        } else {
          this.onstat({ st, entry, file, dir, isSymbolicLink }, then);
        }
      }
    })
  }

  walkerOpt (entry, opts) {
    return {
      path: this.path + '/' + entry,
      parent: this,
      ignoreFiles: this.ignoreFiles,
      follow: this.follow,
      includeEmpty: this.includeEmpty,
      ...opts,
    };
  }

  walker (entry, opts, then) {
    new Walker(this.walkerOpt(entry, opts)).on('done', then).start();
  }

  filterEntry (entry, partial) {
    let included = true;

    if (this.parent && this.parent.filterEntry) {
      const pt = this.basename + '/' + entry;
      included = this.parent.filterEntry(pt, partial);
    }

    this.ignoreFiles.forEach(f => {
      if (this.ignoreRules[f]) {
        this.ignoreRules[f].forEach(rule => {
          // negation means inclusion
          // so if it's negated, and already included, no need to check
          // likewise if it's neither negated nor included
          if (rule.negate !== included) {
            // first, match against /foo/bar
            // then, against foo/bar
            // then, in the case of partials, match with a /
            const match = rule.match('/' + entry) ||
              rule.match(entry) ||
              (!!partial && (
                rule.match('/' + entry + '/') ||
                rule.match(entry + '/'))) ||
              (!!partial && rule.negate && (
                rule.match('/' + entry, true) ||
                rule.match(entry, true)));

            if (match) {
              included = rule.negate;
            }
          }
        })
      }
    })

    return included;
  }
}

class WalkerSync extends Walker {
  start () {
    this.onReaddir(fs.readdirSync(this.path));
    return this;
  }

  addIgnoreFile (file, then) {
    const ig = path.resolve(this.path, file);
    this.onReadIgnoreFile(file, fs.readFileSync(ig, 'utf8'), then);
  }

  stat ({ entry, file, dir }, then) {
    const abs = this.path + '/' + entry;
    let st = fs.lstatSync(abs);
    const isSymbolicLink = st.isSymbolicLink();
    if (this.follow && isSymbolicLink) {
      st = fs.statSync(abs);
    }

    this.onstat({ st, entry, file, dir, isSymbolicLink }, then);
  }

  walker (entry, opts, then) {
    new WalkerSync(this.walkerOpt(entry, opts)).start();
    then();
  }
}

const walk = (opts: IOptions, callback?) => {
  const p = new Promise((resolve, reject) => {
    new Walker(opts).on('done', resolve).on('error', reject).start();
  })
  return callback ? p.then(res => callback(null, res), callback) : p;
}

const walkSync = (opts: IOptions) => new WalkerSync(opts).start().result;

walk.sync = walkSync;
walk.Walker = Walker;
walk.WalkerSync = WalkerSync;

export default walk
