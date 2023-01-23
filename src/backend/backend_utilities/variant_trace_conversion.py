from pm4py.objects.log.obj import Trace, Event


def variant_to_trace(variant: any) -> Trace:
    t = Trace()
    for e in variant:
        assert type(e) == str
        event = Event()
        event["concept:name"] = e
        t.append(event)

    return t
