# CI REPORT (19 Oct 2026): python3 tools/cireport.py <dir>: the run's statuses, the tail of its log, and the start-up profile in one
# GitHub annotation, so a session that can't download artifacts or logs can read them through the checks API.
import json, os, sys
d = sys.argv[1] if len(sys.argv) > 1 else 'out'
rd = lambda p: open(os.path.join(d, p)).read() if os.path.exists(os.path.join(d, p)) else ''
parts = ['STATUS ' + rd('status.txt').replace('\n', '; ')]
try:
    j = json.loads(rd('startprof.json'))
    lt = j.pop('longTasks', [])[:12]
    for k in ('start', 'parkSW'):
        if k in j and isinstance(j[k], dict):
            j[k]['sys'] = dict(list(j[k].get('sys', {}).items())[:12])
    parts.append('PROF ' + json.dumps(j, separators=(',', ':')))
    parts.append('LONGTASKS ' + json.dumps(lt))
except Exception as e:
    parts.append('PROF none ' + str(e) + ' ' + rd('startprof.log')[-1500:])
parts.append('LOG ' + rd('log.txt')[-3000:])
msg = '\n'.join(parts)[:60000].replace('%', '%25').replace('\r', '').replace('\n', '%0A')
print('::notice title=report::' + msg)
